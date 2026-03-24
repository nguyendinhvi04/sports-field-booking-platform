import { NextRequest } from "next/server";
import { updateBookingStatus } from "@/services/booking.service";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * PATCH /api/owner/bookings/[bookingId]/status
 * Chủ sân cập nhật trạng thái đơn (CANCELLED, COMPLETED, v.v.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleErr = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleErr) return roleErr;

    const { status } = await req.json();
    if (!status) return errorResponse("Thiếu trạng thái cập nhật", 400);

    const booking = await updateBookingStatus(bookingId, user.userId, status);
    return successResponse("Cập nhật trạng thái thành công", booking);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "BOOKING_NOT_FOUND") return errorResponse("Không tìm thấy đơn đặt sân", 404);
      if (error.message === "UNAUTHORIZED") return errorResponse("Bạn không có quyền thao tác trên đơn này", 403);
    }
    return serverErrorResponse(error);
  }
}
