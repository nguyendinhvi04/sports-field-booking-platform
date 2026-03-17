import { prisma } from "@/lib/prisma";

/**
 * Lấy danh sách các câu lạc bộ (sân) gần vị trí tọa độ người dùng trong bán kính cho trước
 */
export async function getNearbyClubs(lat: number, lng: number, radiusKm: number = 20) {
  // Sử dụng công thức Haversine để tính khoảng cách (đơn vị: KM)
  // 6371 là bán kính trung bình của Trái Đất (đơn vị: KM)
  const clubs = await prisma.$queryRaw`
    SELECT 
      id, 
      name, 
      slug,
      address, 
      "logoUrl", 
      "coverImageUrl", 
      latitude, 
      longitude,
      (6371 * acos(
        cos(radians(${lat})) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${lng})) + 
        sin(radians(${lat})) * sin(radians(latitude))
      )) AS distance
    FROM clubs
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      AND "isActive" = true
      AND "approvalStatus" = 'APPROVED'
      AND (6371 * acos(
        cos(radians(${lat})) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${lng})) + 
        sin(radians(${lat})) * sin(radians(latitude))
      )) <= ${radiusKm}
    ORDER BY distance ASC
    LIMIT 20
  `;
  
  return clubs;
}

/**
 * Lấy chi tiết câu lạc bộ kèm các sân (courts)
 */
export async function getClubBySlug(slug: string) {
  return prisma.club.findUnique({
    where: { slug },
    include: {
      courts: {
        include: {
          images: true,
          pricings: true
        }
      },
      images: true,
      openingHours: true,
      amenities: {
        include: {
          amenity: true
        }
      }
    }
  });
}
