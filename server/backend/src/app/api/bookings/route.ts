import { NextRequest } from "next/server";
import { createBookingSchema } from "@/validations/booking.schema";
import { createBooking, getMyBookings } from "@/services/booking.service";
import { createPaymentUrl } from "@/services/payment.service";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// GET /api/bookings — Lấy danh sách booking của user đang đăng nhập
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const bookings = await getMyBookings(user.userId);
    return successResponse("Lấy danh sách đặt sân thành công", bookings);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/bookings — Tạo booking mới
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Dữ liệu không hợp lệ", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const booking = await createBooking(user.userId, parsed.data);
    
    let paymentUrl = null;
    if (parsed.data.paymentMethod === "VNPAY" || parsed.data.paymentMethod === "MOMO") {
      const ipAddr = req.headers.get("x-forwarded-for") || "127.0.0.1";
      paymentUrl = await createPaymentUrl(booking.id, Number(booking.finalAmount), parsed.data.paymentMethod, ipAddr);
    }

    return successResponse("Đặt sân thành công! Vui lòng thanh toán để xác nhận.", { booking, paymentUrl }, 201);
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMap: Record<string, [string, number]> = {
        SLOT_NOT_FOUND: ["Khung giờ không tồn tại", 404],
        SLOT_NOT_AVAILABLE: ["Khung giờ đã được đặt hoặc bị khoá", 409],
        SLOT_TAKEN: ["Khung giờ vừa được người khác đặt. Vui lòng chọn lại.", 409],
        COURT_NOT_FOUND: ["Sân không tồn tại", 404],
        VOUCHER_INVALID: ["Mã giảm giá không hợp lệ hoặc đã hết hạn", 422],
        VOUCHER_EXHAUSTED: ["Mã giảm giá đã hết lượt sử dụng", 422],
        VOUCHER_MIN_ORDER: ["Giá trị đơn hàng chưa đạt tối thiểu để dùng voucher", 422],
      };
      const [msg, status] = errorMap[error.message] || [];
      if (msg) return errorResponse(msg, status);
    }
    return serverErrorResponse(error);
  }
}
