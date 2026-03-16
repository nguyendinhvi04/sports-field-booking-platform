import { NextRequest } from "next/server";
import { getMyProfile } from "@/services/auth.service";
import { updateMyProfile } from "@/services/user.service";
import { updateProfileSchema } from "@/validations/user.schema";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// GET /api/users/me → lấy thông tin user đang đăng nhập (Me)
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const profile = await getMyProfile(user.userId);
    if (!profile) return errorResponse("Không tìm thấy người dùng", 404);

    return successResponse("Lấy thông tin thành công", profile);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PUT /api/users/me → cập nhật thông tin user đang đăng nhập
export async function PUT(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser(req);
    if (authError) return authError;

    const body = await req.json();

    // 1. Validate data
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Dữ liệu không hợp lệ", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    // 2. Chạy hàm update logic
    const updatedUser = await updateMyProfile(user.userId, parsed.data);
    
    // 3. Trả về kết quả
    return successResponse("Cập nhật thông tin thành công", updatedUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "PHONE_EXISTS") {
        return errorResponse("Số điện thoại này đã được sử dụng", 409);
      }
    }
    return serverErrorResponse(error);
  }
}
