import { NextRequest } from "next/server";
import { verifyToken, extractTokenFromHeader, JwtPayload } from "@/lib/jwt";
import { errorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";

/**
 * Lấy thông tin user đã xác thực từ request.
 * Dùng trong các route cần đăng nhập.
 *
 * @example
 * const { user, error } = await getAuthUser(req);
 * if (error) return error;
 */
export async function getAuthUser(
  req: NextRequest
): Promise<{ user: JwtPayload; error: null } | { user: null; error: ReturnType<typeof errorResponse> }> {
  const token = extractTokenFromHeader(req.headers.get("authorization"));

  if (!token) {
    return {
      user: null,
      error: errorResponse("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.", 401),
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      user: null,
      error: errorResponse("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.", 401),
    };
  }

  // 1. Kiểm tra session (Nếu có SID)
  if (payload.sid) {
    const session = await prisma.session.findUnique({
      where: { id: payload.sid },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return {
        user: null,
        error: errorResponse("Phiên đăng nhập đã hết hạn hoặc bị thu hồi. Vui lòng đăng nhập lại.", 401),
      };
    }
  }

  // 2. Kiểm tra User tồn tại trong DB (Tránh trường hợp DB vừa bị seed/wipe)
  const userExists = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true }
  });

  if (!userExists) {
    return {
      user: null,
      error: errorResponse("Tài khoản không tồn tại trên hệ thống. Vui lòng đăng nhập lại.", 401),
    };
  }

  return { user: payload, error: null };
}

/**
 * Kiểm tra user có đúng role yêu cầu không.
 *
 * @example
 * const check = requireRole(user, ["ADMIN", "OWNER"]);
 * if (check) return check;
 */
export function requireRole(
  user: JwtPayload,
  roles: string[]
): ReturnType<typeof errorResponse> | null {
  if (!roles.includes(user.role)) {
    return errorResponse("Bạn không có quyền thực hiện thao tác này.", 403);
  }
  return null;
}
