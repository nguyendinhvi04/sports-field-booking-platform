import { NextRequest } from "next/server";
import { toggleUserActiveStatus } from "@/modules/admin/admin.service";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * PATCH /api/admin/users/:id/status
 * Khóa hoặc mở khóa tài khoản người dùng
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isActive } = await req.json();

    const updatedUser = await toggleUserActiveStatus(id, isActive);
    return successResponse("Cập nhật trạng thái người dùng thành công", updatedUser);
  } catch (error: unknown) {
    console.error("PATCH Admin User Status Error:", error);
    return serverErrorResponse(error);
  }
}
