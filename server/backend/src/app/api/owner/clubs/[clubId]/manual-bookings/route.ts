import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { createManualBooking } from "@/services/booking.service";
import { manualBookingSchema } from "@/validations/manual-booking.schema";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * POST /api/owner/clubs/[clubId]/manual-bookings
 * Tạo booking trực tiếp tại quầy (Offline booking)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleCheck = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleCheck) return roleCheck;

    const { clubId } = params;
    const body = await req.json();

    // Validate input
    const parsed = manualBookingSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "Dữ liệu không hợp lệ",
        422,
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const booking = await createManualBooking(user.userId, clubId, parsed.data);

    return successResponse("Tạo đơn đặt sân thủ công thành công", booking, 201);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "CLUB_NOT_FOUND_OR_UNAUTHORIZED") {
        return errorResponse("Bạn không có quyền thực hiện thao tác này", 403);
      }
      if (error.message === "SLOT_NOT_AVAILABLE" || error.message === "SLOT_TAKEN") {
        return errorResponse("Sân đã được đặt trong khoảng thời gian này", 409);
      }
      if (error.message === "SLOT_NOT_FOUND") {
        return errorResponse("Không tìm thấy thông tin giờ đặt", 404);
      }
    }
    return serverErrorResponse(error);
  }
}
