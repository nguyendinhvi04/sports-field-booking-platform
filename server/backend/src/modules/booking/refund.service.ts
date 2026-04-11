import { prisma } from "@/lib/prisma";
import { RefundStatus } from "@/generated/prisma";

/**
 * Tính toán số tiền hoàn dựa trên chính sách của sân
 */
export async function calculateRefundAmount(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      club: {
        include: { owner: { include: { ownerProfile: true } } }
      },
      payment: true,
      items: {
        include: { timeSlot: true }
      }
    }
  });

  if (!booking || !booking.payment || booking.payment.status !== "CONFIRMED" || !booking.club || booking.items.length === 0) {
    throw new Error("BOOKING_NOT_FOUND_OR_NOT_PAID");
  }

  // Lấy thời gian bắt đầu của slot sớm nhất trong đơn
  const earliestSlotStart = booking.items.reduce((prev: Date, curr: { timeSlot: { startTime: Date } }) => {
    return (prev < curr.timeSlot.startTime) ? prev : curr.timeSlot.startTime;
  }, booking.items[0].timeSlot.startTime);

  const now = new Date();
  const timeUntilStart = earliestSlotStart.getTime() - now.getTime();
  const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);

  let refundPercentage = 0;
  
  // Logic mẫu dựa trên thời gian hủy (Có thể tùy biến theo cancellationPolicy của owner)
  if (hoursUntilStart >= 24) {
    refundPercentage = 100; // Hủy trước 24h hoàn 100%
  } else if (hoursUntilStart >= 12) {
    refundPercentage = 50;  // Hủy trước 12h hoàn 50%
  } else {
    refundPercentage = 0;   // Dưới 12h không hoàn
  }

  const refundAmount = (Number(booking.finalAmount) * refundPercentage) / 100;

  return {
    bookingId: booking.id,
    finalAmount: Number(booking.finalAmount),
    refundPercentage,
    refundAmount,
    policy: booking.club.owner.ownerProfile?.cancellationPolicy || "Mặc định: Trước 24h hoàn 100%, 12h hoàn 50%, dưới 12h không hoàn."
  };
}

/**
 * User gửi yêu cầu hoàn tiền
 */
export async function requestRefund(userId: string, bookingId: string, reason: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { payment: true }
  });

  if (!booking || !booking.payment) throw new Error("BOOKING_NOT_FOUND");
  if (booking.payment.refundStatus !== "NONE") throw new Error("REFUND_ALREADY_REQUESTED");

  const { refundAmount } = await calculateRefundAmount(bookingId);

  return prisma.payment.update({
    where: { bookingId },
    data: {
      refundStatus: "REQUESTED",
      refundAmount,
      refundReason: reason,
      refundRequestAt: new Date()
    }
  });
}

/**
 * Chủ sân hoặc Admin xử lý yêu cầu hoàn tiền
 */
export async function processRefund(
  ownerId: string, 
  bookingId: string, 
  data: { 
    approved: boolean; 
    refundAmount?: number; 
    note?: string 
  }
) {
  // 1. Kiểm tra quyền chủ sân
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, club: { ownerId } },
    include: { payment: true }
  });

  if (!booking || !booking.payment) throw new Error("BOOKING_NOT_FOUND");
  if (booking.payment.refundStatus !== "REQUESTED") throw new Error("NO_PENDING_REFUND_REQUEST");

  const finalStatus: RefundStatus = data.approved ? "APPROVED" : "REJECTED";

  return prisma.payment.update({
    where: { bookingId },
    data: {
      refundStatus: finalStatus,
      refundAmount: data.refundAmount !== undefined ? data.refundAmount : booking.payment.refundAmount,
      refundReviewAt: new Date(),
      refundReviewBy: ownerId,
      refundNote: data.note,
      // Nếu đã APPROVED, có thể chuyển trạng thái payment (Dùng cho logic chuyển tiền thực tế)
      ...(data.approved && { status: "REFUNDED" })
    }
  });
}
