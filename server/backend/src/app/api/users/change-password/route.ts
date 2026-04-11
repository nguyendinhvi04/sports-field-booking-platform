import { NextRequest } from "next/server";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { changePassword } from "@/modules/user/user.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * POST /api/users/change-password
 * Người dùng đăng nhập đổi mật khẩu
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return errorResponse("Vui lòng cung cấp mật khẩu cũ và mật khẩu mới", 400);
    }

    if (newPassword.length < 6) {
      return errorResponse("Mật khẩu mới phải từ 6 ký tự", 400);
    }

    await changePassword(user.userId, { currentPassword, newPassword });
    return successResponse("Đổi mật khẩu thành công", null);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CURRENT_PASSWORD") {
        return errorResponse("Mật khẩu cũ không chính xác", 400);
      }
    }
    return serverErrorResponse(error);
  }
}
