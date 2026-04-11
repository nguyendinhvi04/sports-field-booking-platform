import { prisma } from "@/lib/prisma";

/**
 * Lấy danh sách toàn bộ tiện ích có sẵn trong hệ thống (Wifi, Parking...)
 */
export async function getAllAmenities() {
  return prisma.amenity.findMany({
    orderBy: { name: 'asc' }
  });
}

/**
 * Lấy danh sách tiện ích của một CLB cụ thể
 */
export async function getClubAmenities(clubId: string) {
  return prisma.clubAmenity.findMany({
    where: { clubId },
    include: {
      amenity: true
    }
  });
}

/**
 * Cập nhật danh sách tiện ích cho một CLB (Dành cho Owner)
 */
export async function updateClubAmenities(
  clubId: string, 
  ownerId: string, 
  amenityData: { amenityId: string; note?: string }[]
) {
  // 1. Kiểm tra quyền sở hữu CLB
  const club = await prisma.club.findFirst({
    where: { id: clubId, ownerId }
  });
  if (!club) throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");

  // 2. Cập nhật trong transaction (Xóa cũ, Thêm mới)
  return prisma.$transaction(async (tx) => {
    // Xóa hết cũ
    await tx.clubAmenity.deleteMany({
      where: { clubId }
    });

    // Thêm mới toàn bộ
    if (amenityData.length > 0) {
      return tx.clubAmenity.createMany({
        data: amenityData.map(item => ({
          clubId,
          amenityId: item.amenityId,
          note: item.note
        }))
      });
    }

    return { count: 0 };
  });
}

/**
 * Tạo mới một tiện ích vào hệ thống (Chủ sân hoặc Admin có thể đề xuất)
 */
export async function createSystemAmenity(name: string, icon?: string) {
  return prisma.amenity.upsert({
    where: { name },
    create: { name, icon },
    update: { icon }
  });
}
