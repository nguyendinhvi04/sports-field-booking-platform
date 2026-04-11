import { prisma } from "../lib/prisma";
import { notifyNewBooking } from "../lib/socket";
import cron from "node-cron";

/**
 * Tự động hủy các đơn đặt sân quá hạn thanh toán
 * Một đơn hàng được coi là quá hạn nếu:
 * 1. Trạng thái là WAITING_PAYMENT
 * 2. Được tạo cách đây hơn 5 phút (hoặc tùy chỉnh qua biến môi trường)
 */
export async function expirePendingBookings() {
  const EXPIRE_TIME_MINUTES = Number(process.env.BOOKING_EXPIRE_MINUTES) || 30;
  const expirationThreshold = new Date(Date.now() - EXPIRE_TIME_MINUTES * 60 * 1000);

  console.log(`[JOB] Checking for expired bookings before ${expirationThreshold.toISOString()}...`);

  try {
    // 1. Tìm các đơn cần hủy
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "WAITING_PAYMENT",
        createdAt: {
          lt: expirationThreshold,
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    if (expiredBookings.length === 0) {
      console.log("[JOB] No expired bookings found.");
      return;
    }

    console.log(`[JOB] Found ${expiredBookings.length} expired bookings. Starting cancellation...`);

    for (const booking of expiredBookings) {
      try {
        await prisma.$transaction(async (tx) => {
          // A. Cập nhật trạng thái Booking
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: "CANCELLED" },
          });

          // B. Giải phóng các TimeSlots
          const slotIds = booking.items.map((item) => item.timeSlotId);
          await tx.timeSlot.updateMany({
            where: { id: { in: slotIds } },
            data: { status: "AVAILABLE" },
          });

          // C. Cập nhật trạng thái Payment (nếu có)
          if (booking.payment) {
            await tx.payment.update({
              where: { id: booking.payment.id },
              data: { status: "CANCELLED" },
            });
          }
        });

        // D. Thông báo Real-time cho các client đang xem sân này
        if (booking.clubId) {
          notifyNewBooking(booking.clubId, {
            bookingId: booking.id,
            type: "booking-expired",
          });
        }

        console.log(`[JOB] Successfully expired booking ${booking.id} (Club: ${booking.clubId})`);
      } catch (err) {
        console.error(`[JOB] Failed to expire booking ${booking.id}:`, err);
      }
    }

    console.log(`[JOB] Completed processing ${expiredBookings.length} bookings.`);
  } catch (error) {
    console.error("[JOB] Critical error in expirePendingBookings job:", error);
  }
}

/**
 * Khởi tạo Cron Job chạy mỗi 1 phút
 */
export function initBookingJobs() {
  // Chạy mỗi phút: "* * * * *"
  cron.schedule("* * * * *", async () => {
    await expirePendingBookings();
  });

  console.log("[CRON] Booking expiration job scheduled (every 1 minute)");
}
