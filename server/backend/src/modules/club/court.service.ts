import { prisma } from "@/lib/prisma";
import { CreateCourtInput } from "@/validations/court.schema";
import { generateSlotsForWeek } from "./slot.service";

/**
 * Tạo mới một sân (court) thuộc một câu lạc bộ (club)
 */
export async function createCourt(clubId: string, ownerId: string, input: CreateCourtInput) {
  // 1. Kiểm tra quyền sở hữu CLB trước khi thêm sân
  const club = await prisma.club.findFirst({
    where: { id: clubId, ownerId },
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");
  }

  const court = await prisma.court.create({
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

  // 2. Tự động sinh lịch sân cho 7 ngày tới
  await generateSlotsForWeek(court.id);

  return court;
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

/**
 * Cập nhật thông tin sân (Dành cho Owner)
 */
export async function updateCourt(courtId: string, ownerId: string, input: Partial<CreateCourtInput>) {
  // 1. Kiểm tra quyền sở hữu sân thông qua CLB
  const court = await prisma.court.findFirst({
    where: { id: courtId, club: { ownerId } },
  });

  if (!court) throw new Error("COURT_NOT_FOUND_OR_UNAUTHORIZED");

  return prisma.court.update({
    where: { id: courtId },
    data: input,
    include: { pricings: true, images: true }
  });
}

/**
 * Xóa sân (Soft Delete - chuyển trạng thái sang INACTIVE)
 */
export async function deleteCourt(courtId: string, ownerId: string) {
  const court = await prisma.court.findFirst({
    where: { id: courtId, club: { ownerId } },
  });

  if (!court) throw new Error("COURT_NOT_FOUND_OR_UNAUTHORIZED");

  // Chuyển sang trạng thái INACTIVE để giữ lại lịch sử booking (Soft Delete)
  return prisma.court.update({
    where: { id: courtId },
    data: { status: "INACTIVE" }
  });
}
