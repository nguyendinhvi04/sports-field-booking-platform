import { getAllUsersAdmin } from "@/modules/admin/admin.service";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/admin/users
 * Lấy danh sách tất cả người dùng (Dành cho Admin)
 */
export async function GET() {
  try {
    const users = await getAllUsersAdmin();
    return successResponse("Lấy danh sách người dùng thành công", users);
  } catch (error: unknown) {
    console.error("GET Admin Users Error:", error);
    return serverErrorResponse(error);
  }
}
