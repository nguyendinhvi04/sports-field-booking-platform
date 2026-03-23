import { NextRequest } from "next/server";
import { getClubById, updateClub } from "@/services/club.service";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";
import { updateClubSchema } from "@/validations/club.schema";

/**
 * GET /api/owner/clubs/[clubId]
 * Lấy chi tiết thông tin câu lạc bộ (Dành cho chủ sân)
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

        const club = await getClubById(clubId, user.userId);
        if (!club) return errorResponse("Không tìm thấy câu lạc bộ hoặc bạn không có quyền truy cập", 404);

        return successResponse("Lấy chi tiết câu lạc bộ thành công", club);
    } catch (error: unknown) {
        return serverErrorResponse(error);
    }
}

/**
 * PATCH /api/owner/clubs/[clubId]
 * Cập nhật thông tin câu lạc bộ
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ clubId: string }> }
) {
    try {
        const { clubId } = await params;
        const { user, error } = await getAuthUser(req);
        if (error) return error;

        const roleErr = requireRole(user, ["OWNER", "ADMIN"]);
        if (roleErr) return roleErr;

        const body = await req.json();
        const parsed = updateClubSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                "Dữ liệu không hợp lệ", 
                422, 
                parsed.error.flatten().fieldErrors as Record<string, string[]>
            );
        }

        const club = await updateClub(clubId, user.userId, parsed.data);
        return successResponse("Cập nhật câu lạc bộ thành công", club);
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "CLUB_NOT_FOUND_OR_UNAUTHORIZED") {
            return errorResponse("Không tìm thấy câu lạc bộ hoặc bạn không có quyền truy cập", 403);
        }
        return serverErrorResponse(error);
    }
}
