import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/validations/auth.schema";
import { resetPassword } from "@/services/auth.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// POST /api/auth/reset-password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Dữ liệu không hợp lệ", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    await resetPassword(parsed.data);

    return successResponse("Mật khẩu đã được đặt lại thành công", null);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INVALID_OR_EXPIRED_TOKEN") {
      return errorResponse("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", 400);
    }
    return serverErrorResponse(error);
  }
}
