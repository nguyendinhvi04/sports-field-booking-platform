import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { toggleSlotStatus } from "@/modules/slot/slot.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";


/**
 * POST /api/owner/slots/lock
 * Chủ sân chủ động đóng/mở khung giờ
 * Body: { slotId: "...", status: "LOCKED" | "AVAILABLE" }
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleError = requireRole(user, ["OWNER"]);
    if (roleError) return roleError;

    const body = await req.json();
    const { courtId, startTime, endTime, status } = body;

    if (!courtId || !startTime || !endTime || !status) {
      return errorResponse("Thiếu thông tin courtId, startTime, endTime hoặc status", 400);
    }

    const updatedSlot = await toggleSlotStatus(
      courtId, 
      new Date(startTime), 
      new Date(endTime), 
      user.userId, 
      status
    );

    const message = status === "LOCKED" ? "Đã khóa khung giờ" : "Đã mở lại khung giờ";
    return successResponse(message, updatedSlot);
  } catch (error) {
    if (error instanceof Error && error.message === "CANNOT_TOGGLE_BOOKED_SLOT_CANCEL_BOOKING_FIRST") {
      return errorResponse("Khung giờ này đã có người đặt, vui lòng hủy đơn trước khi đóng sân", 400);
    }
    return serverErrorResponse(error);
  }
}
