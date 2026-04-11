import { getAuthUser } from "@/middlewares/auth.middleware";
import { logoutUser } from "@/modules/user/auth.service";
import { successResponse, errorResponse } from "@/lib/response";
import { NextRequest } from "next/server";

// POST /api/auth/logout
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    if (user.sid) {
      await logoutUser(user.sid);
    }

    return successResponse("Đăng xuất thành công", null);
  } catch (error: unknown) {
    console.error("Logout Error:", error);
    return errorResponse("Có lỗi xảy ra khi đăng xuất");
  }
}
