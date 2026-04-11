import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest } from "next/server";
import { loginSchema } from "@/validations/auth.schema";
import { loginUser } from "@/modules/user/auth.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra Rate Limit (Tối đa 5 lần thử mỗi phút cho IP)
    const rateLimitError = await checkRateLimit(req, 5, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    // 2. Lấy IP và User Agent
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    //check validate
    if (!parsed.success) {
      return errorResponse("Dữ liệu không hợp lệ", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const result = await loginUser(parsed.data, ip, userAgent);
    return successResponse("Đăng nhập thành công", result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CREDENTIALS") {
        return errorResponse("Email hoặc mật khẩu không đúng", 401);
      }
      if (error.message === "ACCOUNT_DISABLED") {
        return errorResponse("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.", 403);
      }
      if (error.message.startsWith("ACCOUNT_LOCKED")) {
        const mins = error.message.split(":")[1];
        return errorResponse(`Tài khoản hiện đang bị khóa do nhập sai mật khẩu 5 lần. Vui lòng thử lại sau ${mins} phút.`, 429);
      }
    }
    return serverErrorResponse(error);
  }
}
