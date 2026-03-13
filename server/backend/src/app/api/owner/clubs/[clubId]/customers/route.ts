import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { getClubCustomers } from "@/services/club-customer.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/owner/clubs/[clubId]/customers
 * Lấy danh sách khách hàng của một CLB (Chỉ dành cho Owner CLB đó)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    // Phải là OWNER hoặc ADMIN
    const roleCheck = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleCheck) return roleCheck;

    const { clubId } = params;

    const customers = await getClubCustomers(clubId, user.userId);
    
    return successResponse("Lấy danh sách khách hàng thành công", customers);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CLUB_NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Bạn không có quyền truy cập dữ liệu của CLB này", 403);
    }
    return serverErrorResponse(error);
  }
}
