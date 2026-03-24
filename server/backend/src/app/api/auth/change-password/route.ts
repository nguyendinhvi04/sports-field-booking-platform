import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;

// PATCH /api/auth/change-password → Đổi mật khẩu khi đã đăng nhập
export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const body = await req.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return errorResponse("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.", 422);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse("Mật khẩu mới và xác nhận mật khẩu không trùng khớp.", 422);
    }

    if (newPassword.length < 8) {
      return errorResponse("Mật khẩu mới phải có ít nhất 8 ký tự.", 422);
    }

    // Lấy passwordHash hiện tại từ DB
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { passwordHash: true },
    });

    if (!dbUser || !dbUser.passwordHash) {
      return errorResponse("Tài khoản này không dùng mật khẩu (đăng nhập bằng Google/Facebook).", 400);
    }

    // Kiểm tra mật khẩu cũ
    const isOldPasswordValid = await bcrypt.compare(oldPassword, dbUser.passwordHash);
    if (!isOldPasswordValid) {
      return errorResponse("Mật khẩu hiện tại không đúng.", 401);
    }

    // Hash và lưu mật khẩu mới
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.userId },
      data: { passwordHash: newHash },
    });

    return successResponse("Đổi mật khẩu thành công! Vui lòng đăng nhập lại nếu cần.", null);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
