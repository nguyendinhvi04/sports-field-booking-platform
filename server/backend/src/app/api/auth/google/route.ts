import { NextRequest } from "next/server";
import { loginWithGoogle } from "@/services/auth.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// POST /api/auth/google
export async function POST(req: NextRequest) {
  try {
    const { idToken, role } = await req.json();

    if (!idToken) {
      return errorResponse("Thiếu Google ID token", 400);
    }

    // Xử lý login/register bằng Google qua service
    const result = await loginWithGoogle(idToken, role || "USER");

    return successResponse("Đăng nhập Google thành công", result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "GOOGLE_AUTH_FAILED") {
      return errorResponse("Xác thực Google thất bại", 401);
    }
    return serverErrorResponse(error);
  }
}
