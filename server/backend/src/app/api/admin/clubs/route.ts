import { NextRequest } from "next/server";
import { getAllClubsAdmin } from "@/modules/admin/admin.service";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/admin/clubs
 * Lấy toàn bộ danh sách câu lạc bộ cho trang Admin
 */
export async function GET(req: NextRequest) {
  try {
    // Lưu ý: Trong thực tế nên kiểm tra role Admin tại middleware hoặc ở đây
    // Ví dụ: const user = await getCurrentUser(req); if (user?.role !== 'ADMIN') return forbiddenResponse();

    const clubs = await getAllClubsAdmin();
    return successResponse("Lấy danh sách CLB thành công", clubs);
  } catch (error: unknown) {
    console.error("GET Admin Clubs Error:", error);
    return serverErrorResponse(error);
  }
}
