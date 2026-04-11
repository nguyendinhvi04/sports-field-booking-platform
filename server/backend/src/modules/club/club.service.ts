import { prisma } from "@/lib/prisma";
import { Prisma, SportType } from "@/generated/prisma";

export interface SearchClubFilters {
  name?: string;
  sport?: string;
  city?: string;
  district?: string;
  surface?: string;
  format?: string;
  facility?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  limit?: number;
  date?: string;
  startTime?: string;
}


/**
 * Lấy danh sách các câu lạc bộ (sân) gần vị trí tọa độ người dùng trong bán kính cho trước
 */
export async function getNearbyClubs(lat: number, lng: number, radiusKm: number = 20) {
  // We can just call searchClubs with lat/lng/radius to reuse the logic and includes
  return searchClubs({ lat, lng, radiusKm, limit: 20 });
}

/**
 * Lấy chi tiết câu lạc bộ kèm các sân (courts)
 */
export async function getClubBySlug(slug: string) {
  return prisma.club.findFirst({
    where: { slug, deletedAt: null },
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
  const { 
    name, 
    sport, 
    city, 
    district, 
    surface, 
    format, 
    facility, 
    minPrice, 
    maxPrice, 
    minRating, 
    date,
    startTime,
    lat, 
    lng, 
    radiusKm = 20, 
    limit = 50 
  } = filters;

  const where: Prisma.ClubWhereInput = {
    isActive: true,
    approvalStatus: 'APPROVED',
    deletedAt: null,
  };

  if (name) where.name = { contains: name, mode: 'insensitive' };
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
  if (surface || format || minPrice || maxPrice) {
    where.courts = {
      ...where.courts,
      some: {
        ...(where.courts?.some || {}),
        ...(surface ? { surface: { contains: surface, mode: 'insensitive' } } : {}),
        ...(format ? { indoorOutdoor: format.toUpperCase() } : {}),
        ...(minPrice || maxPrice ? {
          pricings: {
            some: {
              ...(minPrice ? { pricePerHour: { gte: minPrice } } : {}),
              ...(maxPrice ? { pricePerHour: { lte: maxPrice } } : {}),
              isActive: true
            }
          }
        } : {})
      }
    };
  }

  // Lọc theo khoảng ngày (date)
  // Chỉ lấy những CLB có sân có ít nhất 1 TimeSlot trạng thái AVAILABLE trong ngày đó
  if (date) {
    let gte = new Date(`${date}T00:00:00.000Z`);
    let lte = new Date(`${date}T23:59:59.999Z`);

    // Nếu có chọn giờ cụ thể (HH:mm)
    if (startTime) {
      gte = new Date(`${date}T${startTime}:00.000Z`);
      lte = new Date(`${date}T${startTime}:59.999Z`);
    }
    
    where.courts = {
      ...where.courts,
      some: {
        ...(where.courts?.some || {}),
        timeSlots: {
          some: {
            startTime: { gte, lte },
            status: 'AVAILABLE'
          }
        }
      }
    };
  }

  // Lọc theo tiện ích (amenities)
  if (facility && facility.length > 0) {
    const facilityList = Array.isArray(facility) ? facility : [facility];
    // Sử dụng logic AND: Club phải có TẤT CẢ các tiện ích được chọn
    where.AND = facilityList.map((fName: string) => ({
      amenities: {
        some: {
          amenity: {
            name: { equals: fName, mode: "insensitive" },
          },
        },
      },
    }));
  }

  const clubs = await prisma.club.findMany({
    where,
    include: {
      courts: {
        include: {
          pricings: true,
          images: true,
          _count: {
            select: { favoredBy: true }
          }
        }
      },
      amenities: {
        include: {
          amenity: true
        }
      },
      _count: {
        select: { bookings: true }
      }
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  const processedClubs = clubs.map((club) => {
    // Tính giá thấp nhất (minPrice) từ tất cả các sân của CLB
    let currentMinPrice = null;
    const allPricings = club.courts.flatMap((c) => c.pricings);
    if (allPricings.length > 0) {
      currentMinPrice = Math.min(...allPricings.map((p) => Number(p.pricePerHour)));
    }

    // Tính khoảng cách nếu có lat/lng
    let distance = null;
    if (lat && lng && club.latitude && club.longitude) {
      const R = 6371; // Bán kính trái đất (km)
      const dLat = (club.latitude - lat) * Math.PI / 180;
      const dLon = (club.longitude - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(club.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = R * c;
    }

    return {
      ...club,
      minPrice: currentMinPrice,
      distance: distance ? parseFloat(distance.toFixed(2)) : null,
      rating: 4.5 + (Math.random() * 0.5), // Mockup rating
      reviewCount: club._count.bookings + 5,
      isPartner: true,
      hasOnlineBooking: club.courts.length > 0,
      amenities: club.amenities.map((a) => ({
        id: a.amenity.id,
        name: a.amenity.name,
        price: Number(a.price),
        key: a.amenity.name.toLowerCase().replace(/\s+/g, '_')
      }))
    };
  });

  // Lọc theo minRating và distance (nếu có)
  return processedClubs.filter(club => {
    if (minRating && club.rating < minRating) return false;
    if (lat && lng && radiusKm && club.distance && club.distance > radiusKm) return false;
    return true;
  });
}

/**
 * Lấy chi tiết câu lạc bộ theo ID và Owner (Dùng cho Owner Dashboard)
 */
export async function getClubById(id: string, ownerId: string) {
  return prisma.club.findFirst({
    where: { id, ownerId, deletedAt: null },
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
    where: { ownerId, deletedAt: null },
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
    where: { id: clubId, ownerId, deletedAt: null },
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");
  }

  return prisma.club.update({
    where: { id: clubId },
    data,
  });
}

/**
 * Xoá mềm câu lạc bộ (soft delete)
 */
export async function deleteClub(clubId: string, ownerId: string) {
  const club = await prisma.club.findFirst({
    where: { id: clubId, ownerId, deletedAt: null },
  });
  if (!club) throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");

  return prisma.club.update({
    where: { id: clubId },
    data: { deletedAt: new Date(), isActive: false },
  });
}


export async function getAllAmenities() {
  return prisma.amenity.findMany({
    orderBy: { name: 'asc' }
  });
}

/**
 * Cập nhật danh sách tiện ích của CLB (Kèm giá tiền)
 * logic: Xoá hết amenities cũ và insert lại bộ mới (hoặc sync thông minh)
 */
export async function updateClubAmenities(clubId: string, ownerId: string, amenities: { amenityId: string, price: number }[]) {
  // 1. Verify ownership
  const club = await prisma.club.findFirst({
    where: { id: clubId, ownerId, deletedAt: null },
  });
  if (!club) throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");

  // 2. Clear old ones and create new ones (Transaction)
  return prisma.$transaction(async (tx) => {
    // Xoá tất cả tiện ích cũ
    await tx.clubAmenity.deleteMany({
      where: { clubId }
    });

    // Tạo mới các tiện ích được chọn
    if (amenities.length > 0) {
      await tx.clubAmenity.createMany({
        data: amenities.map(a => ({
          clubId,
          amenityId: a.amenityId,
          price: a.price || 0
        }))
      });
    }

    // Trả về danh sách đã cập nhật
    return tx.clubAmenity.findMany({
      where: { clubId },
      include: { amenity: true }
    });
  });
}
