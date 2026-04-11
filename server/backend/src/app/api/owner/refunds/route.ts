import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { processRefund } from "@/modules/booking/refund.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * PATCH /api/owner/refunds
 * Chủ sân phê duyệt hoặc từ chối yêu cầu hoàn tiền
 * Body: { bookingId, approved, refundAmount?, note? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleError = requireRole(user, ["OWNER"]);
    if (roleError) return roleError;

    const body = await req.json();
    const { bookingId, approved, refundAmount, note } = body;

    if (!bookingId || approved === undefined) {
      return errorResponse("Thiếu thông tin (bookingId, approved)", 400);
    }

    const updatedPayment = await processRefund(user.userId, bookingId, {
      approved, refundAmount, note
    });

    const message = approved ? "Đã phê duyệt yêu cầu hoàn tiền" : "Đã từ chối yêu cầu hoàn tiền";
    return successResponse(message, updatedPayment);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
