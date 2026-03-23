import { NextRequest } from "next/server";
import { getBookingByClubId } from "@/services/booking.service";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/owner/clubs/[clubId]/bookings
 * Lấy danh sách đơn đặt sân của một câu lạc bộ
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clubId: string }> }
) {
    try {
        const { clubId } = await params;
        const { user, error } = await getAuthUser(req);
        if (error) return error;

        const roleErr = requireRole(user, ["OWNER", "ADMIN"]);
        if (roleErr) return roleErr;

        // Lấy query params nếu có truyền ngày lọc
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date") || undefined;

        const bookings = await getBookingByClubId(clubId, user.userId, date);
        return successResponse("Lấy danh sách đơn đặt sân thành công", bookings);
    } catch (error: unknown) {
        return serverErrorResponse(error);
    }
}
