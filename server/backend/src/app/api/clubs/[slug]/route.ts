import { NextRequest } from "next/server";
import { getClubBySlug } from "@/services/club.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/clubs/[slug]
 * Lấy thông tin chi tiết một câu lạc bộ kèm các sân
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return errorResponse("Thiếu slug câu lạc bộ", 400);
    }

    const club = await getClubBySlug(slug);

    if (!club) {
      return errorResponse("Không tìm thấy câu lạc bộ", 404);
    }

    return successResponse("Lấy thông tin chi tiết câu lạc bộ thành công", club);
  } catch (error: unknown) {
    console.error("GET Club Details Error:", error);
    return serverErrorResponse(error);
  }
}
