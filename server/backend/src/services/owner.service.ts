import { prisma } from "@/lib/prisma";

// ============================================================
// OWNER SERVICE - Quản lý hồ sơ & KYC của chủ sân
// ============================================================

export interface OnboardingInput {
  // Bước 1: Thông tin cá nhân
  idCardNumber: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  businessLicenseUrl?: string;
  taxCode?: string;
  // Bước 2: Tài khoản ngân hàng
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  // Bước 3: Quy định vận hành
  cancellationPolicy?: string;
}

/**
 * Lưu thông tin Onboarding của Owner vào bảng OwnerProfile.
 * Sau khi lưu thành công, cập nhật isVerified = true trên bảng User.
 */
export async function submitOwnerOnboarding(userId: string, input: OnboardingInput) {
  // Dùng transaction để đảm bảo cả 2 thao tác đều thành công hoặc rollback
  return prisma.$transaction(async (tx) => {
    // 1. Upsert OwnerProfile: tạo mới nếu chưa có, update nếu đã có
    const ownerProfile = await tx.ownerProfile.upsert({
      where: { userId },
      create: {
        userId,
        idCardNumber: input.idCardNumber,
        idCardFrontUrl: input.idCardFrontUrl,
        idCardBackUrl: input.idCardBackUrl,
        businessLicenseUrl: input.businessLicenseUrl,
        taxCode: input.taxCode,
        bankName: input.bankName,
        bankAccountNumber: input.bankAccountNumber,
        bankAccountName: input.bankAccountName,
        cancellationPolicy: input.cancellationPolicy,
        kycStatus: "PENDING", // Admin sẽ duyệt sau
      },
      update: {
        idCardNumber: input.idCardNumber,
        idCardFrontUrl: input.idCardFrontUrl,
        idCardBackUrl: input.idCardBackUrl,
        businessLicenseUrl: input.businessLicenseUrl,
        taxCode: input.taxCode,
        bankName: input.bankName,
        bankAccountNumber: input.bankAccountNumber,
        bankAccountName: input.bankAccountName,
        cancellationPolicy: input.cancellationPolicy,
        kycStatus: "PENDING",
      },
    });

    // 2. Đánh dấu User đã hoàn thành onboarding (isVerified = true)
    // Lưu ý: isVerified ở đây nghĩa là đã NỘP hồ sơ, Admin vẫn đang xét duyệt kycStatus
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { isVerified: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
      },
    });

    return {
      ownerProfile,
      user: {
        ...updatedUser,
        name: updatedUser.fullName,
      },
    };
  });
}

/**
 * Lấy thông tin OwnerProfile của chính owner đang đăng nhập
 */
export async function getMyOwnerProfile(userId: string) {
  return prisma.ownerProfile.findUnique({
    where: { userId },
  });
}

/**
 * Cập nhật thông tin tài khoản ngân hàng (từ trang Settings)
 */
export async function updateOwnerBankInfo(
  userId: string,
  data: { bankName: string; bankAccountNumber: string; bankAccountName: string }
) {
  return prisma.ownerProfile.update({
    where: { userId },
    data,
  });
}

/**
 * Cập nhật thông tin cá nhân của Owner (fullName, phone, bio)
 */
export async function updateOwnerProfile(
  userId: string,
  data: { fullName?: string; phone?: string; bio?: string }
) {
  const { bio, ...userFields } = data;

  // Cập nhật song song: bảng users và user_profiles
  const [user] = await prisma.$transaction([
    // Cập nhật fullName và phone trên bảng users
    prisma.user.update({
      where: { id: userId },
      data: {
        ...(userFields.fullName ? { fullName: userFields.fullName } : {}),
        ...(userFields.phone !== undefined ? { phone: userFields.phone } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
      },
    }),
    // Cập nhật bio trên bảng user_profiles (upsert phòng trường hợp profile chưa tồn tại)
    prisma.userProfile.upsert({
      where: { userId },
      create: { userId, bio: bio || "" },
      update: { ...(bio !== undefined ? { bio } : {}) },
    }),
  ]);

  return { ...user, name: user.fullName };
}
