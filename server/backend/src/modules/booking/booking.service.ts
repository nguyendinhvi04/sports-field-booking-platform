import { prisma } from "@/lib/prisma";
import { PaymentMethod, BookingStatus, PaymentStatus, Prisma } from "@/generated/prisma";
import type { CreateBookingInput } from "@/validations/booking.schema";
import type { ManualBookingInput } from "@/validations/manual-booking.schema";
import { eventEmitter } from "@/lib/events";
import { bookingRepository } from "@/modules/booking/booking.repository";

/**
 * Booking Service (Modular & Scalable version)
 * Handles business logic, calculates prices/vouchers, coordinates transactions.
 * Decoupled from side effects using eventEmitter.
 */

/**
 * Handle new booking creation (Hybrid Slot approach)
 */
export async function createBooking(userId: string, input: CreateBookingInput) {
  // 0. Preliminary checks
  const club = await prisma.club.findUnique({
    where: { id: input.clubId },
    select: { id: true, slotDuration: true }
  });
  if (!club) throw new Error("CLUB_NOT_FOUND");

  // 1. "Ensure" slots exist (Upsert) and get details
  const slotPromises = input.slots.map(async (s) => {
    const startTime = new Date(s.startTime);
    const endTime = new Date(startTime.getTime() + club.slotDuration * 60000);

    return prisma.timeSlot.upsert({
      where: { courtId_startTime: { courtId: s.courtId, startTime } },
      create: {
        courtId: s.courtId,
        startTime,
        endTime,
        status: "AVAILABLE"
      },
      update: {},
      include: {
        court: {
          include: {
            club: { select: { slotDuration: true } },
            pricings: { where: { isActive: true } }
          }
        }
      }
    });
  });

  const slots = await Promise.all(slotPromises);
  const timeSlotIds = slots.map(s => s.id);

  if (slots.some(s => s.status !== "AVAILABLE")) {
    throw new Error("SLOT_NOT_AVAILABLE");
  }

  // 3. Price calculation logic
  let totalAmount = 0;
  const slotPrices: { slotId: string; price: number }[] = [];

  for (const slot of slots) {
    const slotHour = slot.startTime.getHours();
    const slotDow = slot.startTime.getDay();
    const court = slot.court;

    const pricing = court.pricings.find((p) => {
      const pStart = new Date(p.startTime).getHours();
      const pEnd = new Date(p.endTime).getHours();
      const pDow = p.dayOfWeek;

      let isTimeMatch = false;
      if (pStart === pEnd) isTimeMatch = true;
      else if (pStart < pEnd) isTimeMatch = slotHour >= pStart && slotHour < pEnd;
      else isTimeMatch = slotHour >= pStart || slotHour < pEnd;

      return isTimeMatch && (pDow === null || pDow === slotDow);
    });

    const pricePerHour = pricing ? Number(pricing.pricePerHour?.toString() || 0) : 0;
    const sDuration = club.slotDuration || 60;
    const price = isNaN(pricePerHour) ? 0 : (pricePerHour * sDuration) / 60;

    totalAmount += price;
    slotPrices.push({ slotId: slot.id, price });
  }

  // 3b. Service/Amenity calculation
  const selectedServices: { amenityId: string; price: number }[] = [];
  if (input.serviceIds && input.serviceIds.length > 0) {
    const clubAmenities = await prisma.clubAmenity.findMany({
      where: {
        clubId: input.clubId,
        amenityId: { in: input.serviceIds }
      }
    });

    for (const ca of clubAmenities) {
      const p = Number(ca.price?.toString() || 0);
      if (!isNaN(p)) {
        totalAmount += p;
        selectedServices.push({ amenityId: ca.amenityId, price: p });
      } else {
        selectedServices.push({ amenityId: ca.amenityId, price: 0 });
      }
    }
  }

  // 4. Voucher application
  let discountAmount = 0;
  let voucherId: string | undefined;
  if (input.voucherCode) {
    const voucher = await prisma.voucher.findFirst({
      where: {
        code: input.voucherCode,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        OR: [{ clubId: input.clubId }, { clubId: null }],
      },
      include: {
        usages: { where: { userId } }
      }
    });

    if (voucher) {
      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) throw new Error("VOUCHER_EXHAUSTED");
      if (voucher.usages.length >= voucher.usagePerUser) throw new Error("VOUCHER_LIMIT_EXCEEDED");
      if (voucher.minOrderAmount && totalAmount < Number(voucher.minOrderAmount?.toString() || 0)) throw new Error("VOUCHER_MIN_ORDER");

      voucherId = voucher.id;
      const vVal = Number(voucher.value?.toString() || 0);
      if (voucher.type === "PERCENTAGE") {
        discountAmount = (totalAmount * vVal) / 100;
        const maxD = voucher.maxDiscount ? Number(voucher.maxDiscount.toString()) : null;
        if (maxD && discountAmount > maxD) discountAmount = maxD;
      } else {
        discountAmount = vVal;
      }
    } else {
      throw new Error("VOUCHER_INVALID");
    }
  }

  // Ensure no NaN values
  totalAmount = isNaN(totalAmount) ? 0 : totalAmount;
  discountAmount = isNaN(discountAmount) ? 0 : discountAmount;
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  // 5. Transaction - DB Update using Repository
  return await prisma.$transaction(async (tx) => {
    // Check & Book slots (FOR UPDATE)
    const lockedSlots = await tx.timeSlot.findMany({
      where: { id: { in: timeSlotIds }, status: "AVAILABLE" },
    });
    if (lockedSlots.length !== timeSlotIds.length) throw new Error("SLOT_TAKEN");

    await tx.timeSlot.updateMany({
      where: { id: { in: timeSlotIds } },
      data: { status: "BOOKED" },
    });

    // Record Voucher Usage if applicable
    if (voucherId) {
      await tx.voucher.update({
        where: { id: voucherId },
        data: { usedCount: { increment: 1 } }
      });

      await tx.voucherUsage.create({
        data: {
          voucherId,
          userId,
          usedAt: new Date()
        }
      });
    }

    const newBooking = await bookingRepository.create({
      user: { connect: { id: userId } },
      club: { connect: { id: input.clubId } },
      status: BookingStatus.WAITING_PAYMENT,
      totalAmount,
      discountAmount,
      finalAmount,
      bookerName: input.bookerName,
      bookerPhone: input.bookerPhone,
      bookerEmail: input.bookerEmail,
      note: input.note,
      voucher: voucherId ? { connect: { id: voucherId } } : undefined,
      items: {
        create: slotPrices.map((sp) => ({
          timeSlot: { connect: { id: sp.slotId } },
          price: sp.price,
        })),
      },
      services: {
        create: selectedServices.map((s) => ({
          amenity: { connect: { id: s.amenityId } },
          price: s.price,
        })),
      },
      payment: {
        create: {
          method: (input.paymentMethod as PaymentMethod) || PaymentMethod.BANK_TRANSFER,
          status: PaymentStatus.WAITING_PAYMENT,
          amount: finalAmount,
        },
      },
    }, tx as Prisma.TransactionClient);

    // ── DECOUPLED NOTIFICATION ──────────────────────────
    // Just emit the event, don't care how it's handled (Socket/Mail/Push)
    eventEmitter.emit('booking.created', {
      clubId: input.clubId,
      booking: newBooking,
      type: 'new-booking'
    });

    return newBooking;
  });
}

/**
 * Create a manual booking (for Admins/Owners at the counter)
 */
export async function createManualBooking(ownerId: string, input: ManualBookingInput) {
  const club = await prisma.club.findFirst({
    where: { id: input.clubId, ownerId },
    select: { id: true, slotDuration: true }
  });
  if (!club) throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");

  // Upsert slots logic (Keep standard for now, but Repository could abstract this later)
  const slotPromises = input.slots.map(async (s) => {
    const startTime = new Date(s.startTime);
    const endTime = new Date(startTime.getTime() + club.slotDuration * 60000);
    return prisma.timeSlot.upsert({
      where: { courtId_startTime: { courtId: s.courtId, startTime } },
      create: { courtId: s.courtId, startTime, endTime, status: "AVAILABLE" },
      update: {},
      include: { court: { include: { pricings: { where: { isActive: true } } } } }
    });
  });

  const slots = await Promise.all(slotPromises);
  const timeSlotIds = slots.map(s => s.id);

  if (slots.some(s => s.status !== "AVAILABLE")) throw new Error("SLOT_NOT_AVAILABLE");

  // Price calculation
  let totalAmount = 0;
  const slotPrices: { slotId: string; price: number }[] = [];
  for (const slot of slots) {
    const slotHour = slot.startTime.getHours();
    const slotDow = slot.startTime.getDay();
    const pricing = slot.court.pricings.find(p => {
      const pStart = new Date(p.startTime).getHours();
      const pEnd = new Date(p.endTime).getHours();
      const pDow = p.dayOfWeek;
      return slotHour >= pStart && slotHour < pEnd && (pDow === null || pDow === slotDow);
    });
    const pricePerHour = Number(pricing?.pricePerHour?.toString() || 0);
    const price = isNaN(pricePerHour) ? 0 : (pricePerHour * (club.slotDuration || 60)) / 60;
    totalAmount += price;
    slotPrices.push({ slotId: slot.id, price });
  }

  return prisma.$transaction(async (tx) => {
    const check = await tx.timeSlot.findMany({ where: { id: { in: timeSlotIds }, status: "AVAILABLE" } });
    if (check.length !== timeSlotIds.length) throw new Error("SLOT_TAKEN");

    await tx.timeSlot.updateMany({ where: { id: { in: timeSlotIds } }, data: { status: "BOOKED" } });

    const booking = await bookingRepository.create({
      user: { connect: { id: ownerId } },
      club: { connect: { id: club.id } },
      status: input.isPaid ? BookingStatus.CONFIRMED : BookingStatus.WAITING_PAYMENT,
      totalAmount,
      finalAmount: totalAmount,
      bookerName: input.bookerName,
      bookerPhone: input.bookerPhone,
      bookerEmail: input.bookerEmail,
      note: input.note,
      items: {
        create: slotPrices.map(sp => ({
          timeSlot: { connect: { id: sp.slotId } },
          price: sp.price
        }))
      },
      payment: {
        create: {
          method: PaymentMethod.CASH,
          status: input.isPaid ? PaymentStatus.CONFIRMED : PaymentStatus.WAITING_PAYMENT,
          amount: totalAmount,
          paidAt: input.isPaid ? new Date() : null
        }
      }
    }, tx as Prisma.TransactionClient);

    eventEmitter.emit('booking.created', {
      clubId: club.id,
      booking,
      type: 'manual-booking-created'
    });

    return booking;
  });
}

/**
 * Get user's booking history
 */
export async function getMyBookings(userId: string) {
  return bookingRepository.findByUserId(userId);
}

/**
 * Cancel a booking
 */
export async function cancelBooking(userId: string, bookingId: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await bookingRepository.findFirst({
      id: bookingId,
      userId,
      status: "WAITING_PAYMENT"
    }, { items: true });

    if (!booking) throw new Error("Không thể hủy đơn đặt sân này");

    // 1. Update status
    const updatedBooking = await bookingRepository.updateStatus(bookingId, "CANCELLED", tx as Prisma.TransactionClient);

    // 2. Release slots
    await bookingRepository.releaseSlots(bookingId, tx as Prisma.TransactionClient);

    // 3. Update payment
    await tx.payment.updateMany({
      where: { bookingId },
      data: { status: "CANCELLED" },
    });

    eventEmitter.emit('booking.cancelled', {
      clubId: booking.clubId,
      booking: updatedBooking
    });

    return updatedBooking;
  });
}

/**
 * Cancel a booking by code (for Frontend/Customer)
 */
export async function cancelBookingByCode(userId: string, bookingCode: string) {
  const booking = await prisma.booking.findFirst({
    where: { bookingCode, userId },
    select: { id: true }
  });
  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  return cancelBooking(userId, booking.id);
}

/**
 * Update status (for Admins/Owners)
 */
export async function updateBookingStatus(
  ownerId: string,
  bookingId: string,
  status: BookingStatus
) {
  const booking = await bookingRepository.findFirst({
    id: bookingId,
    club: { ownerId }
  }, { items: true });

  if (!booking) throw new Error("Không tìm thấy đơn đặt sân");

  return prisma.$transaction(async (tx) => {
    const updatedBooking = await bookingRepository.updateStatus(bookingId, status, tx as Prisma.TransactionClient);

    // Side effects logic
    if (status === "CANCELLED") {
      await bookingRepository.releaseSlots(bookingId, tx as Prisma.TransactionClient);
      await tx.payment.updateMany({
        where: { bookingId },
        data: { status: "CANCELLED" },
      });
    }

    eventEmitter.emit('booking.status_updated', {
      clubId: booking.clubId,
      booking: updatedBooking,
      type: 'booking-status-updated'
    });

    return updatedBooking;
  });
}

/**
 * Confirm payment manually (Owner confirms user's payment proof)
 */
export async function confirmPaymentManual(bookingId: string, ownerId: string) {
  const booking = await bookingRepository.findById(bookingId);

  if (!booking) throw new Error("BOOKING_NOT_FOUND");

  if (booking.clubId) {
    const club = await prisma.club.findFirst({
      where: { id: booking.clubId, ownerId }
    });
    if (!club) throw new Error("UNAUTHORIZED");
  } else {
    // If it's a legacy booking without clubId, we might need a different check 
    // but for this platform it should have clubId.
    throw new Error("UNAUTHORIZED");
  }

  const payment = await prisma.payment.findUnique({
    where: { bookingId }
  });

  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  if (payment.status === PaymentStatus.CONFIRMED) throw new Error("PAYMENT_ALREADY_CONFIRMED");

  const updatedBooking = await prisma.$transaction(async (tx) => {
    // 1. Update Payment
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CONFIRMED,
        paidAt: new Date(),
        confirmedAt: new Date(),
        confirmedBy: ownerId
      }
    });

    // 2. Update Booking status to CONFIRMED
    return await bookingRepository.updateStatus(bookingId, BookingStatus.CONFIRMED, tx as Prisma.TransactionClient);
  });

  // 3. Emit event for socket/notifications ONLY after successful transaction commit
  eventEmitter.emit('booking.status_updated', {
    clubId: booking.clubId,
    booking: updatedBooking,
    type: 'payment-confirmed-manual'
  });

  return updatedBooking;
}

/**
 * Lấy danh sách đơn đặt sân của một câu lạc bộ (Dành cho chủ sân)
 */
export async function getBookingByClubId(clubId: string, ownerId: string, date?: string) {
  const club = await prisma.club.findFirst({
    where: { id: clubId, ownerId },
  });
  if (!club) throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");

  const where: Prisma.BookingWhereInput = { clubId };
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    where.items = {
      some: {
        timeSlot: {
          startTime: { gte: startOfDay, lte: endOfDay }
        }
      }
    };
  }

  return prisma.booking.findMany({
    where,
    include: {
      user: { select: { fullName: true, phone: true, email: true } },
      items: { include: { timeSlot: { include: { court: { select: { name: true } } } } } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Lấy chi tiết booking theo bookingCode (cho trang checkout reload)
 */
export async function getBookingByCode(bookingCode: string, userId: string) {
  return prisma.booking.findFirst({
    where: { bookingCode, userId },
    include: {
      club: { select: { name: true, slug: true, address: true } },
      items: {
        include: {
          timeSlot: {
            include: { court: { select: { name: true } } }
          }
        }
      },
      payment: { select: { method: true, status: true } },
    },
  });
}
