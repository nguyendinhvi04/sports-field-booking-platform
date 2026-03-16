import { NextRequest } from "next/server";
import { loginWithFacebook } from "@/services/auth.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// POST /api/auth/facebook
export async function POST(req: NextRequest) {
  try {
    const { accessToken, role } = await req.json();

    if (!accessToken) {
      return errorResponse("Thiếu Facebook access token", 400);
    }

    // Xử lý login/register bằng Facebook qua service
    const result = await loginWithFacebook(accessToken, role || "USER");

    return successResponse("Đăng nhập Facebook thành công", result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "FACEBOOK_AUTH_FAILED") {
      return errorResponse("Xác thực Facebook thất bại", 401);
    }
    return serverErrorResponse(error);
  }
}
