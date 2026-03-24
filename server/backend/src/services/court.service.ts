import { prisma } from "@/lib/prisma";
import { CreateCourtInput } from "@/validations/court.schema";

/**
 * Tạo mới một sân (court) thuộc một câu lạc bộ (club)
 */
export async function createCourt(clubId: string, input: CreateCourtInput) {
  return prisma.court.create({
    data: {
      clubId,
      name: input.name,
      description: input.description,
      sportType: input.sportType,
      capacity: input.capacity,
      surface: input.surface,
      indoorOutdoor: input.indoorOutdoor,
    },
    include: {
      pricings: true,
      images: true,
    }
  });
}

/**
 * Lấy danh sách sân của một câu lạc bộ
 */
export async function getCourtsByClubId(clubId: string) {
  return prisma.court.findMany({
    where: { clubId },
    include: {
      pricings: true,
      images: true,
    }
  });
}
