import { prisma } from "@/lib/prisma";
import { eventEmitter } from "@/lib/events";
import { slotRepository } from "@/modules/slot/slot.repository";

/**
 * Slot Service (Modular version)
 * Handles hybrid slot generation and status management.
 */

/**
 * Logic lai (Hybrid): Tính toán các khung giờ ảo dựa trên giờ mở cửa,
 * sau đó ghép với các bản ghi thực tế trong DB.
 */
export async function getInferredSlotsForCourt(courtId: string, date: Date) {
  // 1. Lấy context sân và câu lạc bộ (Dùng repository)
  const court = await slotRepository.findCourtContext(courtId);
  if (!court) throw new Error("COURT_NOT_FOUND");

  // 2. Xác định giờ mở cửa
  const dayOfWeek = date.getDay();
  const oh = court.club.openingHours.find(h => h.dayOfWeek === dayOfWeek);
  if (!oh || oh.isClosed) return [];

  const slotDuration = court.club.slotDuration;
  
  // 3. Chuẩn bị mốc thời gian lý thuyết
  const start = new Date(date);
  start.setHours(oh.openTime.getHours(), oh.openTime.getMinutes(), 0, 0);

  const end = new Date(date);
  end.setHours(oh.closeTime.getHours(), oh.closeTime.getMinutes(), 0, 0);

  // 4. Lấy các slot thực tế (BOOKED hoặc LOCKED) qua Repository
  const startRange = new Date(new Date(date).setHours(0, 0, 0, 0));
  const endRange = new Date(new Date(date).setHours(23, 59, 59, 999));
  const realSlots = await slotRepository.getBusySlots(courtId, startRange, endRange);

  // 5. Sinh mảng slot ghép
  const results = [];
  let currentStart = new Date(start);

  while (currentStart < end) {
    const nextSlotStart = new Date(currentStart.getTime() + slotDuration * 60000);
    if (nextSlotStart > end) break;

    const startTime = new Date(currentStart);
    const endTime = new Date(nextSlotStart);

    const realOne = realSlots.find(s => s.startTime.getTime() === startTime.getTime());

    results.push({
      id: realOne?.id || `v-${startTime.getTime()}`, 
      startTime,
      endTime,
      status: realOne?.status || "AVAILABLE",
      bookingStatus: realOne?.bookingItems?.[0]?.booking?.status || null
    });

    currentStart = nextSlotStart;
  }

  return results;
}

/**
 * Tự động tạo TimeSlot hoặc đảm bảo nó tồn tại
 */
export async function ensureSlotExists(courtId: string, startTime: Date, endTime: Date) {
  return slotRepository.upsertSlot({
      courtId,
      startTime,
      endTime,
      status: "AVAILABLE"
  });
}

/**
 * Lấy lịch sử slot thô từ DB (Dùng khi cần debug hoặc xem chi tiết)
 */
export async function getSlotsByCourtId(courtId: string, startDate: Date, endDate: Date) {
  return prisma.timeSlot.findMany({
    where: {
      courtId,
      startTime: { gte: startDate },
      endTime: { lte: endDate }
    },
    include: {
      court: { select: { name: true, sportType: true } }
    },
    orderBy: { startTime: 'asc' }
  });
}

/**
 * Chủ sân chủ động đóng/mở khung giờ
 */
export async function toggleSlotStatus(
    courtId: string, 
    startTime: Date, 
    endTime: Date, 
    ownerId: string, 
    newStatus: "LOCKED" | "AVAILABLE"
) {
  // 1. Kiểm tra quyền sở hữu bằng cách join qua Repository hoặc truy vấn nhẹ
  const court = await prisma.court.findFirst({
    where: { id: courtId, club: { ownerId } }
  });
  if (!court) throw new Error("UNAUTHORIZED");

  // 2. Thực hiện cập nhật DB thông qua Repository
  const updatedSlot = await slotRepository.upsertSlot({
    courtId,
    startTime,
    endTime,
    status: newStatus
  });

  // 3. ── DECOUPLED NOTIFICATION ──────────────────────────
  eventEmitter.emit('slot.toggled', {
    clubId: updatedSlot.court.clubId,
    slot: updatedSlot,
    type: `slot-toggled-${newStatus.toLowerCase()}`
  });

  return updatedSlot;
}

// Bác bỏ Legacy code
export async function generateSlotsForCourt(courtId: string, date: Date) {
    return { count: 0, message: "Use hybrid slots logic instead." };
}
