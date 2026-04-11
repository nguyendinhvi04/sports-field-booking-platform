import { NextRequest } from "next/server";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { getMyFavorites, toggleFavorite } from "@/modules/user/favorite.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/favorites
 * Lấy danh sách sân yêu thích của User hiện tại
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const favorites = await getMyFavorites(user.userId);
    return successResponse("Lấy danh sách yêu thích thành công", favorites);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/favorites
 * Thêm hoặc xóa một cơ sở/sân khỏi danh sách yêu thích
 * body: { clubId: "..." } HOẶC { courtId: "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const body = await req.json();
    const { clubId, courtId } = body;

    if (!clubId && !courtId) {
      return errorResponse("Thiếu clubId hoặc courtId", 400);
    }

    const favorite = await toggleFavorite(user.userId, { clubId, courtId });
    return successResponse("Cập nhật danh sách yêu thích thành công", favorite);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
