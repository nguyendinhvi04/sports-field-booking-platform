import { prisma } from "@/lib/prisma";
import type { UpdateProfileInput } from "@/validations/user.schema";

/**
 * Cập nhật thông tin profile của user hiện tại
 */
export async function updateMyProfile(userId: string, input: UpdateProfileInput) {
  // Kiểm tra nếu đổi sđt thì xem sđt đã bị ai dùng chưa
  if (input.phone) {
    const existingPhone = await prisma.user.findFirst({
      where: { 
        phone: input.phone,
        id: { not: userId }
      }
    });

    if (existingPhone) {
      throw new Error("PHONE_EXISTS");
    }
  }

  // Tách riêng dữ liệu update cho bảng user và bảng user_profile
  const userUpdateData: {
    fullName?: string;
    phone?: string | null;
    avatarUrl?: string | null;
  } = {};
  if (input.fullName !== undefined) userUpdateData.fullName = input.fullName;
  if (input.phone !== undefined) userUpdateData.phone = input.phone || null;
  if (input.avatarUrl !== undefined) userUpdateData.avatarUrl = input.avatarUrl || null;

  const profileUpdateData: {
    address?: string;
    gender?: string;
    bio?: string;
    dateOfBirth?: Date | null;
  } = {};
  if (input.address !== undefined) profileUpdateData.address = input.address;
  if (input.gender !== undefined) profileUpdateData.gender = input.gender;
  if (input.bio !== undefined) profileUpdateData.bio = input.bio;
  if (input.dateOfBirth !== undefined) {
    profileUpdateData.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
  }

  // Cập nhật cả 2 bảng 
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...userUpdateData,
      ...(Object.keys(profileUpdateData).length > 0 && {
        profile: {
          upsert: {
            create: profileUpdateData,
            update: profileUpdateData
          }
        }
      })
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      profile: {
        select: {
          address: true,
          dateOfBirth: true,
          gender: true,
          bio: true,
        }
      }
    }
  });

  return updatedUser;
}
