import { NextRequest } from "next/server";
import { updateOwnerBankInfo, updateOwnerProfile } from "@/services/owner.service";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";

// GET /api/owner/profile  → Lấy đầy đủ thông tin Owner (user + ownerProfile + bio)
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;
    const roleError = requireRole(user, ["OWNER"]);
    if (roleError) return roleError;

    // Lấy user + profile + ownerProfile cùng lúc
    const fullProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        profile: { select: { bio: true, address: true, dateOfBirth: true, gender: true } },
        ownerProfile: true,
      },
    });

    if (!fullProfile) return errorResponse("Không tìm thấy thông tin owner.", 404);

    return successResponse("Lấy hồ sơ thành công", {
      ...fullProfile,
      name: fullProfile.fullName,
      bio: fullProfile.profile?.bio || "",
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PATCH /api/owner/profile  → Cập nhật thông tin cá nhân (fullName, phone, bio) hoặc ngân hàng
export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;
    const roleError = requireRole(user, ["OWNER"]);
    if (roleError) return roleError;

    const body = await req.json();
    const { fullName, phone, bio, bankName, bankAccountNumber, bankAccountName } = body;

    const results: Record<string, unknown> = {};

    // Cập nhật thông tin cá nhân nếu có
    if (fullName !== undefined || phone !== undefined || bio !== undefined) {
      const updatedProfile = await updateOwnerProfile(user.userId, {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(bio !== undefined ? { bio } : {}),
      });
      results.profile = updatedProfile;
    }

    // Cập nhật ngân hàng nếu có đủ 3 trường
    if (bankName && bankAccountNumber && bankAccountName) {
      const updatedBank = await updateOwnerBankInfo(user.userId, {
        bankName,
        bankAccountNumber,
        bankAccountName,
      });
      results.bankInfo = updatedBank;
    }

    if (Object.keys(results).length === 0) {
      return errorResponse("Không có dữ liệu nào để cập nhật.", 422);
    }

    return successResponse("Cập nhật thông tin thành công", results);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
