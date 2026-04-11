import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest } from "next/server";
import { createBookingSchema } from "@/validations/booking.schema";
import { createBooking, getMyBookings } from "@/modules/booking/booking.service";
import { createPaymentUrl } from "@/modules/payment/payment.service";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// GET /api/bookings — Lấy danh sách booking của user đang đăng nhập
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const bookings = await getMyBookings(user.userId);
    return successResponse("Lấy danh sách đặt sân thành công", bookings);
  } catch (error: unknown) {
    console.error("[BOOKING_API_ERROR]", error);
    return serverErrorResponse(error);
  }
}

// POST /api/bookings — Tạo booking mới
export async function POST(req: NextRequest) {
  try {
    // Giới hạn đặt sân: 5 lần mỗi phút (Bảo vệ khỏi spam và thử voucher)
    const rateLimitError = await checkRateLimit(req, 5, 60 * 1000, "Bạn đang thực hiện thao tác quá nhanh. Vui lòng đợi một lát.");
    if (rateLimitError) return rateLimitError;

    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Dữ liệu không hợp lệ", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const booking = await createBooking(user.userId, parsed.data);

    let paymentUrl = null;
    if (parsed.data.paymentMethod === "VNPAY" || parsed.data.paymentMethod === "MOMO" || parsed.data.paymentMethod === "CREDIT_CARD") {
      const ipAddr = req.headers.get("x-forwarded-for") || "127.0.0.1";
      paymentUrl = await createPaymentUrl(booking.id, Number(booking.finalAmount), parsed.data.paymentMethod, ipAddr);
    }

    return successResponse("Đặt sân thành công! Vui lòng thanh toán để xác nhận.", { booking, paymentUrl }, 201);
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMap: Record<string, [string, number]> = {
        SLOT_NOT_FOUND_OR_INVALID_CLUB: ["Khung giờ không tồn tại hoặc không thuộc CLB", 404],
        SLOT_NOT_AVAILABLE: ["Khung giờ đã được đặt hoặc bị khoá", 409],
        SLOT_TAKEN: ["Khung giờ vừa được người khác đặt. Vui lòng chọn lại.", 409],
        VOUCHER_INVALID: ["Mã giảm giá không hợp lệ hoặc đã hết hạn", 422],
        VOUCHER_EXHAUSTED: ["Mã giảm giá đã hết lượt sử dụng", 422],
        VOUCHER_LIMIT_EXCEEDED: ["Bạn đã hết lượt sử dụng mã này", 422],
        VOUCHER_MIN_ORDER: ["Giá trị đơn hàng chưa đạt tối thiểu để dùng voucher", 422],
        MOMO_GATEWAY_ERROR: ["Lỗi kết nối cổng thanh toán MoMo. Vui lòng thử lại sau.", 502],
        MOMO_CONFIG_MISSING: ["Cấu hình MoMo chưa hoàn tất. Vui lòng liên hệ Admin.", 500],
        STRIPE_CONFIG_MISSING: ["Cấu hình thanh toán thẻ chưa hoàn tất. Vui lòng liên hệ Admin.", 500],
        STRIPE_SESSION_URL_MISSING: ["Không thể tạo phiên thanh toán. Vui lòng thử lại.", 502],
      };
      const [msg, status] = errorMap[error.message] || [];
      if (msg) return errorResponse(msg, status);

      // Special case: Gateway error might contain more info in the message itself
      if (error.message.startsWith("MOMO_ERROR:")) {
        return errorResponse(error.message.replace("MOMO_ERROR: ", ""), 502);
      }

      console.error("[POST /api/bookings] Server Error:", error);
      return serverErrorResponse(error);
    }
    console.error("[CREATE_BOOKING_ERROR]", error);
    return serverErrorResponse(error);
  }
}
