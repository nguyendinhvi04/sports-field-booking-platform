import { NextRequest } from "next/server";
import { submitOwnerOnboarding } from "@/services/owner.service";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// POST /api/owner/onboarding  → Nộp hồ sơ KYC & hoàn tất Onboarding
export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra xác thực & phân quyền
    const { user, error } = await getAuthUser(req);
    if (error) return error;
    const roleError = requireRole(user, ["OWNER"]);
    if (roleError) return roleError;

    // 2. Lấy dữ liệu từ body
    const body = await req.json();
    const {
      idCardNumber,
      idCardFrontUrl,
      idCardBackUrl,
      businessLicenseUrl,
      taxCode,
      bankName,
      bankAccountNumber,
      bankAccountName,
      cancellationPolicy,
    } = body;

    // 3. Validate các trường bắt buộc
    if (!idCardNumber || !bankName || !bankAccountNumber || !bankAccountName) {
      return errorResponse(
        "Vui lòng cung cấp đầy đủ thông tin: Số CCCD, và thông tin tài khoản ngân hàng.",
        422
      );
    }

    // 4. Gọi service để lưu dữ liệu
    const result = await submitOwnerOnboarding(user.userId, {
      idCardNumber,
      idCardFrontUrl,
      idCardBackUrl,
      businessLicenseUrl,
      taxCode,
      bankName,
      bankAccountNumber,
      bankAccountName,
      cancellationPolicy,
    });

    // 5. Trả về kết quả thành công kèm thông tin user đã cập nhật (isVerified = true)
    return successResponse(
      "Hồ sơ của bạn đã được gửi thành công! Chúng tôi sẽ xét duyệt trong vòng 24-48 giờ làm việc.",
      result,
      201
    );
  } catch (error) {
    return serverErrorResponse(error);
  }
}
