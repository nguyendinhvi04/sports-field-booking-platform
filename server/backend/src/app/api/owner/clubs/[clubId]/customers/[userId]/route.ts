import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { updateCustomerTier } from "@/services/club-customer.service";
import { updateCustomerSchema } from "@/validations/owner.schema";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * PATCH /api/owner/clubs/[clubId]/customers/[userId]
 * Cập nhật hạng thành viên hoặc ghi chú cho khách hàng
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; userId: string }> }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleCheck = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleCheck) return roleCheck;

    const { clubId, userId } = await params;
    const body = await req.json();

    // Validate data
    const parsed = updateCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "Dữ liệu không hợp lệ",
        422,
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updated = await updateCustomerTier(clubId, userId, user.userId, parsed.data);

    return successResponse("Cập nhật thông tin khách hàng thành công", updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CLUB_NOT_FOUND_OR_UNAUTHORIZED") {
      return errorResponse("Bạn không có quyền thực hiện thao tác này", 403);
    }
    return serverErrorResponse(error);
  }
}
