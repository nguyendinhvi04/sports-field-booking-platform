import { prisma } from "@/lib/prisma";
import { Prisma, SportType } from "@/generated/prisma";

export interface SearchClubFilters {
  sport?: string;

  city?: string;
  district?: string;
  surface?: string;
  format?: string;
  facility?: string | string[];
  limit?: number;
}


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
/**
 * Tìm kiếm câu lạc bộ nâng cao với các bộ lọc
 */
export async function searchClubs(filters: SearchClubFilters) {
  const { sport, city, district, surface, format, facility, limit = 50 } = filters;

  const where: Prisma.ClubWhereInput = {
    isActive: true,
    approvalStatus: 'APPROVED',
  };

  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (district) where.district = { contains: district, mode: 'insensitive' };
  
  // Lọc theo môn thể thao thông qua courts
  if (sport) {
    where.courts = {
      some: {
        sportType: sport.toUpperCase() as SportType
      }
    };
  }

  // Lọc theo mặt sân hoặc trong nhà/ngoài trời
  if (surface || format) {
    where.courts = {
      ...where.courts,
      some: {
        ...(where.courts?.some || {}),
        ...(surface ? { surface: { contains: surface, mode: 'insensitive' } } : {}),
        ...(format ? { indoorOutdoor: format.toUpperCase() } : {}),
      }
    };
  }

  // Lọc theo tiện ích (amenities)
  if (facility && facility.length > 0) {
    where.amenities = {
      some: {
        amenity: {
          name: { in: Array.isArray(facility) ? facility : [facility], mode: 'insensitive' }
        }
      }
    };
  }

  const clubs = await prisma.club.findMany({
    where,
    include: {
      courts: {
        include: {
          pricings: true,
          images: true
        }
      },
      amenities: {
        include: {
          amenity: true
        }
      }
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  return clubs.map((club) => {
    // Tính giá thấp nhất (minPrice) từ tất cả các sân của CLB
    let minPrice = null;
    const allPricings = club.courts.flatMap((c) => c.pricings);
    if (allPricings.length > 0) {
      minPrice = Math.min(...allPricings.map((p) => Number(p.pricePerHour)));
    }

    return {
      ...club,
      minPrice,
      rating: 4.8, // Default rating for mockup
      reviewCount: Math.floor(Math.random() * 50) + 10,
      isPartner: true,
      hasOnlineBooking: club.courts.length > 0,
      openNow: true, // Mockup
      closeTime: "22:00",
      amenities: club.amenities.map((a) => a.amenity.name)
    };
  });
}

/**
 * Lấy chi tiết câu lạc bộ theo ID và Owner (Dùng cho Owner Dashboard)
 */
export async function getClubById(id: string, ownerId: string) {
  return prisma.club.findFirst({
    where: { id, ownerId },
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

/**
 * Lấy danh sách câu lạc bộ của một Owner
 */
export async function getClubsByOwner(ownerId: string) {
  return prisma.club.findMany({
    where: { ownerId },
    include: {
      courts: { select: { id: true, name: true, clubId: true, sportType: true } },
      openingHours: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Tạo mới một câu lạc bộ
 */
export async function createClub(ownerId: string, data: Omit<Prisma.ClubUncheckedCreateInput, 'ownerId' | 'slug'>) {
  const slug = (data.name || "club")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim() + "-" + Math.random().toString(36).substring(2, 7);

  return prisma.club.create({
    data: {
      ...data,
      ownerId,
      slug,
    }
  });
}


/**
 * Cập nhật thông tin câu lạc bộ
 */
export async function updateClub(clubId: string, ownerId: string, data: Prisma.ClubUpdateInput) {
  const club = await prisma.club.findFirst({
    where: { id: clubId, ownerId },
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");
  }

  return prisma.club.update({
    where: { id: clubId },
    data,
  });
}
