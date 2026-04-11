import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/validations/auth.schema";
import { forgotPassword } from "@/modules/user/auth.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// POST /api/auth/forgot-password
export async function POST(req: NextRequest) {
  try {
    // Giới hạn quên mật khẩu: 2 lần mỗi phút để tránh spam mail
    const rateLimitError = await checkRateLimit(req, 2, 60 * 1000, "Vui lòng đợi 1 phút trước khi yêu cầu cấp lại mật khẩu mới.");
    if (rateLimitError) return rateLimitError;

    const body = await req.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Email không hợp lệ", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    await forgotPassword(parsed.data.email);

    return successResponse("Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.", null);
  } catch (error: unknown) {
    return serverErrorResponse(error);
  }
}
