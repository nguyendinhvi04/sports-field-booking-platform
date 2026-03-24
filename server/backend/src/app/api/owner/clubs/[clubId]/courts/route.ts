import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { createCourt, getCourtsByClubId } from "@/services/court.service";
import { createCourtSchema } from "@/validations/court.schema";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/owner/clubs/[clubId]/courts
 * Lấy danh sách các sân của một câu lạc bộ cụ thể
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleErr = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleErr) return roleErr;

    const { clubId } = await params;
    
    // Ở đây ta có thể kiểm tra quyền sở hữu tương tự POST
    const courts = await getCourtsByClubId(clubId);
    return successResponse("Lấy danh sách sân thành công", courts);
  } catch (error: unknown) {
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/owner/clubs/[clubId]/courts
 * Thêm một sân mới vào câu lạc bộ (Dành cho chủ sân hoặc Admin)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleCheck = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleCheck) return roleCheck;

    const { clubId } = await params;
    const body = await req.json();

    // Validate input
    const parsed = createCourtSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "Dữ liệu sân không hợp lệ",
        422,
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const court = await createCourt(clubId, user.userId, parsed.data);

    return successResponse("Thêm sân mới thành công", court, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CLUB_NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Bạn không có quyền thực hiện thao tác này trên câu lạc bộ được chọn", 403);
    }
    return serverErrorResponse(error);
  }
}
