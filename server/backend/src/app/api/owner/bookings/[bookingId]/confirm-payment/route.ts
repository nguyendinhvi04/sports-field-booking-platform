import { NextRequest } from "next/server";
import { confirmPaymentManual } from "@/services/booking.service";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * POST /api/owner/bookings/[bookingId]/confirm-payment
 * Chủ sân xác nhận khách đã trả tiền (Ví dụ: khách chuyển khoản xong chụp bill)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleErr = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleErr) return roleErr;

    const booking = await confirmPaymentManual(bookingId, user.userId);
    return successResponse("Xác nhận thanh toán thành công", booking);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "BOOKING_NOT_FOUND") return errorResponse("Không tìm thấy đơn đặt sân", 404);
      if (error.message === "UNAUTHORIZED") return errorResponse("Bạn không có quyền thao tác trên đơn này", 403);
      if (error.message === "PAYMENT_NOT_FOUND") return errorResponse("Không tìm thấy bản ghi thanh toán", 404);
      if (error.message === "PAYMENT_ALREADY_CONFIRMED") return errorResponse("Đơn này đã được xác nhận thanh toán rồi", 400);
    }
    return serverErrorResponse(error);
  }
}
