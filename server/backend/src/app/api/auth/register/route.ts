import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest } from "next/server";
import { registerSchema, loginSchema } from "@/validations/auth.schema";
import { registerUser, loginUser } from "@/modules/user/auth.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    // Giới hạn đăng ký: 3 lần mỗi phút
    const rateLimitError = await checkRateLimit(req, 3, 60 * 1000, "Bạn đăng ký quá nhanh. Vui lòng thử lại sau.");
    if (rateLimitError) return rateLimitError;

    const body = await req.json();

    // 1. Validate đầu vào
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Dữ liệu không hợp lệ", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    // 2. Xử lý nghiệp vụ
    const user = await registerUser(parsed.data);

    // 3. Trả kết quả
    return successResponse("Đăng ký thành công", user, 201);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "EMAIL_EXISTS") {
        return errorResponse("Email này đã được sử dụng", 409);
      }
      if (error.message === "PHONE_EXISTS") {
        return errorResponse("Số điện thoại này đã được sử dụng", 409);
      }
    }
    return serverErrorResponse(error);
  }
}
