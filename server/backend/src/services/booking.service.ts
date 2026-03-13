import { prisma } from "@/lib/prisma";
import type { CreateBookingInput } from "@/validations/booking.schema";
import type { ManualBookingInput } from "@/validations/manual-booking.schema";
import { updateClubCustomerStats } from "./club-customer.service";

// ============================================================
// BOOKING SERVICE
// ============================================================

/**
 * Tạo booking mới (bao gồm kiểm tra slot còn trống và tính tiền)
 */
export async function createBooking(userId: string, input: CreateBookingInput) {
  // Lấy tất cả slot được chọn và kiểm tra trạng thái
  const slots = await prisma.timeSlot.findMany({
    where: {
      id: { in: input.timeSlotIds },
      courtId: input.courtId,
    },
  });

  // Kiểm tra đủ số slot yêu cầu
  if (slots.length !== input.timeSlotIds.length) {
    throw new Error("SLOT_NOT_FOUND");
  }

  // Kiểm tra tất cả slot phải đang AVAILABLE
  const unavailableSlot = slots.find((s) => s.status !== "AVAILABLE");
  if (unavailableSlot) {
    throw new Error("SLOT_NOT_AVAILABLE");
  }

  // Tính tổng giá (lấy giá từ court_pricings theo giờ)
  const court = await prisma.court.findUnique({
    where: { id: input.courtId },
    include: { pricings: { where: { isActive: true } } },
  });
  if (!court) throw new Error("COURT_NOT_FOUND");

  // Tính giá từng slot bằng cách match với pricing
  let totalAmount = 0;
  const slotPrices: { slotId: string; price: number }[] = [];

  for (const slot of slots) {
    const slotHour = slot.startTime.getHours();
    const slotDow = slot.startTime.getDay();

    const pricing = court.pricings.find((p) => {
      const pStart = p.startTime.getHours();
      const pEnd = p.endTime.getHours();
      const pDow = p.dayOfWeek;
      return slotHour >= pStart && slotHour < pEnd && (pDow === null || pDow === slotDow);
    });

    const price = pricing ? Number(pricing.pricePerHour) : 0;
    totalAmount += price;
    slotPrices.push({ slotId: slot.id, price });
  }

  // Áp dụng voucher nếu có
  let discountAmount = 0;
  let voucherId: string | undefined;

  if (input.voucherCode) {
    const voucher = await prisma.voucher.findFirst({
      where: {
        code: input.voucherCode,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        OR: [{ clubId: court.clubId }, { clubId: null }],
      },
    });

    if (!voucher) throw new Error("VOUCHER_INVALID");
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      throw new Error("VOUCHER_EXHAUSTED");
    }
    if (voucher.minOrderAmount && totalAmount < Number(voucher.minOrderAmount)) {
      throw new Error("VOUCHER_MIN_ORDER");
    }

    voucherId = voucher.id;
    if (voucher.type === "PERCENTAGE") {
      discountAmount = (totalAmount * Number(voucher.value)) / 100;
      if (voucher.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
      }
    } else {
      discountAmount = Number(voucher.value);
    }
  }

  const finalAmount = Math.max(0, totalAmount - discountAmount);

  // Dùng transaction để tránh race condition
  const booking = await prisma.$transaction(async (tx) => {
    // Re-check slot status bên trong transaction (lock)
    const lockedSlots = await tx.timeSlot.findMany({
      where: { id: { in: input.timeSlotIds }, status: "AVAILABLE" },
    });
    if (lockedSlots.length !== input.timeSlotIds.length) {
      throw new Error("SLOT_TAKEN");
    }

    // Cập nhật trạng thái slot → BOOKED
    await tx.timeSlot.updateMany({
      where: { id: { in: input.timeSlotIds } },
      data: { status: "BOOKED" },
    });

    // Tạo booking
    const newBooking = await tx.booking.create({
      data: {
        userId,
        courtId: input.courtId,
        status: "WAITING_PAYMENT",
        totalAmount,
        discountAmount,
        finalAmount,
        bookerName: input.bookerName,
        bookerPhone: input.bookerPhone,
        bookerEmail: input.bookerEmail,
        note: input.note,
        voucherId,
        items: {
          create: slotPrices.map((sp) => ({
            timeSlotId: sp.slotId,
            price: sp.price,
          })),
        },
        payment: {
          create: {
            method: "BANK_TRANSFER",
            status: "WAITING_PAYMENT",
            amount: finalAmount,
          },
        },
      },
      include: {
        items: { include: { timeSlot: true } },
        payment: true,
      },
    });

    // Tăng usedCount voucher nếu có
    if (voucherId) {
      await tx.voucher.update({
        where: { id: voucherId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newBooking;
  });

  return booking;
}

/**
 * Chủ sân đặt sân thủ công cho khách (offline)
 */
export async function createManualBooking(ownerId: string, clubId: string, input: ManualBookingInput) {
  // 1. Kiểm tra quyền sở hữu CLB
  const club = await prisma.club.findFirst({
    where: { id: clubId, ownerId },
  });
  if (!club) throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");

  // 2. Tìm hoặc tạo user theo số điện thoại (Guest)
  let user = await prisma.user.findFirst({
    where: { phone: input.bookerPhone },
  });

  if (!user) {
    // Tạo user "vãng lai" nếu chưa tồn tại
    user = await prisma.user.create({
      data: {
        fullName: input.bookerName,
        phone: input.bookerPhone,
        email: input.bookerEmail || `guest_${Date.now()}@sportplatform.com`, // Email giả định nếu không có
        role: "USER",
        isActive: true,
      },
    });
  }

  // 3. Lấy thông tin sân và tính giá (giống createBooking nhưng bỏ qua voucher)
  const slots = await prisma.timeSlot.findMany({
    where: {
      id: { in: input.timeSlotIds },
      courtId: input.courtId,
    },
  });

  if (slots.length !== input.timeSlotIds.length) throw new Error("SLOT_NOT_FOUND");
  if (slots.some((s) => s.status !== "AVAILABLE")) throw new Error("SLOT_NOT_AVAILABLE");

  const court = await prisma.court.findUnique({
    where: { id: input.courtId },
    include: { pricings: { where: { isActive: true } } },
  });
  if (!court) throw new Error("COURT_NOT_FOUND");

  let totalAmount = 0;
  const slotPrices: { slotId: string; price: number }[] = [];

  for (const slot of slots) {
    const slotHour = slot.startTime.getHours();
    const slotDow = slot.startTime.getDay();
    const pricing = court.pricings.find((p) => {
      const pStart = p.startTime.getHours();
      const pEnd = p.endTime.getHours();
      const pDow = p.dayOfWeek;
      return slotHour >= pStart && slotHour < pEnd && (pDow === null || pDow === slotDow);
    });
    const price = pricing ? Number(pricing.pricePerHour) : 0;
    totalAmount += price;
    slotPrices.push({ slotId: slot.id, price });
  }

  try {
    // 4. Thực hiện transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Lock slots
      await tx.timeSlot.updateMany({
        where: { id: { in: input.timeSlotIds } },
        data: { status: "BOOKED" },
      });

      // Tạo booking với trạng thái COMPLETED nếu đã trả tiền
      const newBooking = await tx.booking.create({
        data: {
          userId: user!.id,
          courtId: input.courtId,
          status: input.isPaid ? "COMPLETED" : "CONFIRMED",
          totalAmount,
          discountAmount: 0,
          finalAmount: totalAmount,
          bookerName: input.bookerName,
          bookerPhone: input.bookerPhone,
          bookerEmail: input.bookerEmail,
          note: input.note,
          items: {
            create: slotPrices.map((sp) => ({
              timeSlotId: sp.slotId,
              price: sp.price,
            })),
          },
          payment: {
            create: {
              method: "CASH",
              status: input.isPaid ? "CONFIRMED" : "PENDING",
              amount: totalAmount,
              paidAt: input.isPaid ? new Date() : null,
            },
          },
        },
        include: {
          items: { include: { timeSlot: true } },
          payment: true,
        },
      });

      return newBooking;
    });

    // 5. Cập nhật thống kê khách hàng nếu là COMPLETED
    if (input.isPaid) {
      await updateClubCustomerStats(clubId, user.id, totalAmount);
    }

    return booking;
  } catch (error) {
    console.error("Error in createManualBooking:", error);
    throw error;
  }
}

/**
 * Lấy danh sách booking của user
 */
export async function getMyBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      court: {
        select: {
          name: true,
          sportType: true,
          club: { select: { name: true, address: true } },
        },
      },
      items: { include: { timeSlot: true } },
      payment: { select: { status: true, method: true, amount: true } },
    },
  });
}

/**
 * Hủy booking (chỉ khi còn trong trạng thái cho phép)
 */
export async function cancelBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  if (!["PENDING", "WAITING_PAYMENT"].includes(booking.status)) {
    throw new Error("CANNOT_CANCEL");
  }

  return prisma.$transaction(async (tx) => {
    // Giải phóng các slot
    const itemSlotIds = (
      await tx.bookingItem.findMany({ where: { bookingId } })
    ).map((i) => i.timeSlotId);

    await tx.timeSlot.updateMany({
      where: { id: { in: itemSlotIds } },
      data: { status: "AVAILABLE" },
    });

    return tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
  });
}
