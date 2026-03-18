import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ============================================================
// PRICING SERVICE - Quản lý bảng giá sân
// ============================================================

export interface PricingInput {
  dayOfWeek?: number; // 0-6 hoặc null
  startTime: string;  // "HH:mm:ss"
  endTime: string;    // "HH:mm:ss"
  pricePerHour: number;
  label?: string;     // "Giờ vàng", "Giờ thường"...
}

export interface SpecialPricingInput {
  specificDate: Date;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  note?: string;
}

/**
 * Lấy toàn diện bảng giá của một sân (Gồm cả định kỳ và ngày lễ)
 */
export async function getCourtFullPricing(courtId: string) {
  const [regularPricings, specialPricings] = await Promise.all([
    prisma.courtPricing.findMany({
      where: { courtId, isActive: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.specialDatePricing.findMany({
      where: { 
        courtId, 
        isActive: true,
        specificDate: { gte: new Date() } // Chỉ lấy từ hôm nay trở đi
      },
      orderBy: [{ specificDate: "asc" }, { startTime: "asc" }],
    })
  ]);

  return { regularPricings, specialPricings };
}

/**
 * Thêm/Cập nhật giá định kỳ
 */
export async function upsertRegularPricing(courtId: string, input: PricingInput & { id?: string }) {
  if (input.id) {
    return prisma.courtPricing.update({
      where: { id: input.id },
      data: {
        dayOfWeek: input.dayOfWeek,
        startTime: `1970-01-01T${input.startTime}`, // Prisma @db.Time cần parse
        endTime: `1970-01-01T${input.endTime}`,
        pricePerHour: input.pricePerHour,
        label: input.label,
      }
    });
  }

  return prisma.courtPricing.create({
    data: {
      courtId,
      dayOfWeek: input.dayOfWeek,
      startTime: `1970-01-01T${input.startTime}`,
      endTime: `1970-01-01T${input.endTime}`,
      pricePerHour: input.pricePerHour,
      label: input.label,
    }
  });
}

/**
 * Thêm giá ngày đặc biệt
 */
export async function addSpecialPricing(courtId: string, input: SpecialPricingInput) {
  return prisma.specialDatePricing.create({
    data: {
      courtId,
      specificDate: input.specificDate,
      startTime: `1970-01-01T${input.startTime}`,
      endTime: `1970-01-01T${input.endTime}`,
      pricePerHour: input.pricePerHour,
      note: input.note,
    }
  });
}

/**
 * Xóa cấu hình giá
 */
export async function deletePricing(type: "regular" | "special", id: string) {
  if (type === "regular") {
    return prisma.courtPricing.delete({ where: { id } });
  }
  return prisma.specialDatePricing.delete({ where: { id } });
}

/**
 * LOGIC QUAN TRỌNG: Lấy giá thực tế tại một thời điểm (để tính tiền booking)
 */
export async function getEffectivePrice(courtId: string, dateTime: Date) {
  const dayOfWeek = dateTime.getDay();
  const timeOnly = dateTime.toTimeString().split(' ')[0]; // "HH:mm:ss"
  const dateOnly = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());

  // 1. Ưu tiên tìm trong bảng giá đặc biệt (Special Date)
  const special = await prisma.specialDatePricing.findFirst({
    where: {
      courtId,
      specificDate: dateOnly,
      startTime: { lte: `1970-01-01T${timeOnly}` },
      endTime: { gt: `1970-01-01T${timeOnly}` },
      isActive: true,
    }
  });

  if (special) return special.pricePerHour;

  // 2. Nếu không có giá đặc biệt, tìm trong giá định kỳ
  const regular = await prisma.courtPricing.findFirst({
    where: {
      courtId,
      OR: [
        { dayOfWeek },      // Khớp thứ trong tuần
        { dayOfWeek: null } // Hoặc giá mặc định cho mọi ngày
      ],
      startTime: { lte: `1970-01-01T${timeOnly}` },
      endTime: { gt: `1970-01-01T${timeOnly}` },
      isActive: true,
    },
    orderBy: { dayOfWeek: "desc" } // Ưu tiên cái có dayOfWeek cụ thể hơn là null
  });

  // @ts-expect-error: Prisma.Decimal may not be detected in some setups
  return regular?.pricePerHour || new Prisma.Decimal(0);
}
