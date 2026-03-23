import { NextRequest } from "next/server";
import { getClubsByOwner, createClub } from "@/services/club.service";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";
import { clubSchema } from "@/validations/club.schema";

/**
 * GET /api/owner/clubs
 * Lấy danh sách câu lạc bộ của chủ sân đang đăng nhập
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleErr = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleErr) return roleErr;

    const clubs = await getClubsByOwner(user.userId);
    return successResponse("Lấy danh sách câu lạc bộ thành công", clubs);
  } catch (error: unknown) {
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/owner/clubs
 * Tạo mới một câu lạc bộ
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleErr = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleErr) return roleErr;

    const body = await req.json();
    const parsed = clubSchema.safeParse(body);
    
    if (!parsed.success) {
      return errorResponse(
        "Dữ liệu không hợp lệ", 
        422, 
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const club = await createClub(user.userId, parsed.data);
    return successResponse("Tạo câu lạc bộ thành công", club, 201);
  } catch (error: unknown) {
    return serverErrorResponse(error);
  }
}
