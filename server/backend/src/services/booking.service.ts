import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma";
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
  // 1. Lấy tất cả slot được chọn kèm thông tin Court và Pricing
  const slots = await prisma.timeSlot.findMany({
    where: {
      id: { in: input.timeSlotIds },
      court: { clubId: input.clubId }, // Đảm bảo thuộc đúng Club
    },
    include: {
      court: {
        include: {
          club: { select: { slotDuration: true } },
          pricings: { where: { isActive: true } }
        }
      }
    }
  });

  // 2. Kiểm tra đủ số slot yêu cầu
  if (slots.length !== input.timeSlotIds.length) {
    throw new Error("SLOT_NOT_FOUND_OR_INVALID_CLUB");
  }

  // 3. Kiểm tra trạng thái slot
  if (slots.some(s => s.status !== "AVAILABLE")) {
    throw new Error("SLOT_NOT_AVAILABLE");
  }

  // 4. Tính toán giá tiền cho từng slot (dựa trên pricing của từng sân)
  let totalAmount = 0;
  const slotPrices: { slotId: string; price: number }[] = [];

  for (const slot of slots) {
    const slotHour = slot.startTime.getHours();
    const slotDow = slot.startTime.getDay();
    const court = slot.court;

    const pricing = court.pricings.find((p) => {
      const pStart = p.startTime.getHours();
      const pEnd = p.endTime.getHours();
      const pDow = p.dayOfWeek;
      return slotHour >= pStart && slotHour < pEnd && (pDow === null || pDow === slotDow);
    });

    const pricePerHour = pricing ? Number(pricing.pricePerHour) : 0;
    const price = (pricePerHour * court.club.slotDuration) / 60;
    totalAmount += price;
    slotPrices.push({ slotId: slot.id, price });
  }

  // 5. Áp dụng voucher nếu có
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

  // 6. Transaction
  return await prisma.$transaction(async (tx) => {
    // Re-check slot status inside transaction
    const lockedSlots = await tx.timeSlot.findMany({
      where: { id: { in: input.timeSlotIds }, status: "AVAILABLE" },
    });
    if (lockedSlots.length !== input.timeSlotIds.length) {
      throw new Error("SLOT_TAKEN");
    }

    // Update status -> BOOKED
    await tx.timeSlot.updateMany({
      where: { id: { in: input.timeSlotIds } },
      data: { status: "BOOKED" },
    });

    // Create Booking
    const newBooking = await tx.booking.create({
      data: {
        userId,
        clubId: input.clubId,
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
            method: (input.paymentMethod as PaymentMethod) || "BANK_TRANSFER",
            status: "WAITING_PAYMENT",
            amount: finalAmount,
          },
        },
      },
      include: {
        items: { include: { timeSlot: { include: { court: true } } } },
        payment: true,
      },
    });

    if (voucherId) {
      await tx.voucher.update({
        where: { id: voucherId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newBooking;
  });
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
    user = await prisma.user.create({
      data: {
        fullName: input.bookerName,
        phone: input.bookerPhone,
        email: input.bookerEmail || `guest_${Date.now()}@sportplatform.com`,
        role: "USER",
        isActive: true,
      },
    });
  }

  // 3. Lấy thông tin slots
  const slots = await prisma.timeSlot.findMany({
    where: {
      id: { in: input.timeSlotIds },
      court: { clubId },
    },
    include: {
      court: {
        include: {
          club: { select: { slotDuration: true } },
          pricings: { where: { isActive: true } }
        }
      }
    }
  });

  if (slots.length !== input.timeSlotIds.length) throw new Error("SLOT_NOT_FOUND_OR_INVALID_CLUB");
  if (slots.some((s) => s.status !== "AVAILABLE")) throw new Error("SLOT_NOT_AVAILABLE");

  // 4. Tính toán giá tiền
  let totalAmount = 0;
  const slotPrices: { slotId: string; price: number }[] = [];

  for (const slot of slots) {
    const slotHour = slot.startTime.getHours();
    const slotDow = slot.startTime.getDay();
    const court = slot.court;

    const pricing = court.pricings.find((p) => {
      const pStart = p.startTime.getHours();
      const pEnd = p.endTime.getHours();
      const pDow = p.dayOfWeek;
      return slotHour >= pStart && slotHour < pEnd && (pDow === null || pDow === slotDow);
    });

    const pricePerHour = pricing ? Number(pricing.pricePerHour) : 0;
    const price = (pricePerHour * court.club.slotDuration) / 60;
    totalAmount += price;
    slotPrices.push({ slotId: slot.id, price });
  }

  try {
    // 5. Transaction
    return await prisma.$transaction(async (tx) => {
      // Lock slots
      await tx.timeSlot.updateMany({
        where: { id: { in: input.timeSlotIds } },
        data: { status: "BOOKED" },
      });

      // Create Booking
      const newBooking = await tx.booking.create({
        data: {
          userId: user!.id,
          clubId,
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
          items: { include: { timeSlot: { include: { court: true } } } },
          payment: true,
        },
      });

      // 6. Cập nhật thống kê khách hàng nếu đã trả tiền
      if (input.isPaid) {
        await updateClubCustomerStats(clubId, user!.id, totalAmount);
      }

      return newBooking;
    });
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
      club: {
        select: { name: true, address: true, logoUrl: true },
      },
      items: {
        include: {
          timeSlot: {
            include: { court: { select: { name: true, sportType: true } } }
          }
        }
      },
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

/**
 * Lấy danh sách booking theo id sân
 */
export async function getBookingByCourtId(courtId: string, userId: string) {
  try {
    return prisma.booking.findMany({
      where: {
        userId,
        items: {
          some: {
            timeSlot: { courtId }
          }
        }
      },
      select: {
        id: true,
        bookerName: true,
        bookerPhone: true,
        bookerEmail: true,
        status: true,
        totalAmount: true,
        discountAmount: true,
        finalAmount: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        items: {
          include: {
            timeSlot: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error in getBookingByCourtId:", error);
    throw error;
  }
}

/**
 * Cập nhật trạng thái đơn đặt sân
 */
export async function updateBookingStatus(
  bookingId: string,
  ownerId: string,
  status: "PENDING" | "WAITING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { club: { select: { ownerId: true } } },
  });

  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  if (booking.club.ownerId !== ownerId) throw new Error("UNAUTHORIZED");

  return prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        items: { include: { timeSlot: { include: { court: true } } } },
        payment: true,
      },
    });

    // Nếu hủy sân, giải phóng slot và hủy thanh toán
    if (status === "CANCELLED") {
      const itemSlotIds = updatedBooking.items.map((i) => i.timeSlotId);
      await tx.timeSlot.updateMany({
        where: { id: { in: itemSlotIds } },
        data: { status: "AVAILABLE" },
      });
      if (updatedBooking.payment) {
        await tx.payment.update({
          where: { id: updatedBooking.payment.id },
          data: { status: "CANCELLED" },
        });
      }
    }

    return updatedBooking;
  });
}

/**
 * Xác nhận thanh toán thủ công
 */
export async function confirmPaymentManual(bookingId: string, ownerId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      club: { select: { id: true, ownerId: true } },
      payment: true,
    },
  });

  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  if (booking.club.ownerId !== ownerId) throw new Error("UNAUTHORIZED");
  if (!booking.payment) throw new Error("PAYMENT_NOT_FOUND");
  if (booking.payment.status === "CONFIRMED") throw new Error("PAYMENT_ALREADY_CONFIRMED");

  return prisma.$transaction(async (tx) => {
    // 1. Cập nhật trạng thái payment
    await tx.payment.update({
      where: { id: booking.payment!.id },
      data: {
        status: "CONFIRMED",
        paidAt: new Date(),
        confirmedAt: new Date(),
        confirmedBy: ownerId,
      },
    });

    // 2. Chuyển trạng thái booking sang CONFIRMED
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
      include: {
        items: { include: { timeSlot: { include: { court: true } } } },
        payment: true,
      },
    });

    // 3. Tích lũy điểm/cập nhật thống kê chi tiêu cho khách hàng
    await updateClubCustomerStats(booking.club.id, booking.userId, Number(booking.finalAmount));

    return updatedBooking;
  });
}

/**
 * Lấy danh sách tất cả đơn đặt sân của một CLB
 */
export async function getBookingByClubId(clubId: string, ownerId: string, date?: string) {
  // 1. Kiểm tra quyền sở hữu CLB
  const club = await prisma.club.findFirst({
    where: { id: clubId, ownerId },
  });
  if (!club) throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");

  // 2. Truy vấn danh sách booking
  return prisma.booking.findMany({
    where: {
      clubId,
      ...(date && {
        items: {
          some: {
            timeSlot: {
              startTime: {
                gte: new Date(`${date}T00:00:00.000+07:00`),
                lte: new Date(`${date}T23:59:59.999+07:00`),
              }
            }
          }
        }
      })
    },
    include: {
      items: {
        include: {
          timeSlot: {
            include: { court: true }
          }
        }
      },
      payment: true,
      user: {
        select: {
          fullName: true,
          phone: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}
