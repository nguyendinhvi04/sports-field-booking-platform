import { eventEmitter } from "@/lib/events";
import { notifyNewBooking, notifyBookingStatusChanged } from "@/lib/socket";
import { sendBookingConfirmationEmail, sendBookingWaitingPaymentEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  CREDIT_CARD: 'Thẻ tín dụng',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
  CASH: 'Tiền mặt',
};

/**
 * Booking Event Listener
 * Connects domain events ('booking.created', 'booking.cancelled', etc.) 
 * to side effects like real-time notifications or email sending.
 * This keeps the business logic in the service completely agnostic of these triggers.
 */
export const initBookingListeners = () => {
  /**
   * Listen for new booking creation
   */
  eventEmitter.on('booking.created', async ({ clubId, booking, type }) => {
    // 1. Real-time Socket notification (cho Owner dashboard)
    if (clubId) {
      await notifyNewBooking(clubId, {
        booking,
        type: type || 'new-booking'
      });
    }

    // 2. Gửi email xác nhận/thông tin thanh toán dựa trên phương thức
    try {
      const fullBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
        include: {
          club: { select: { name: true } },
          items: {
            include: {
              timeSlot: {
                include: { court: { select: { name: true } } }
              }
            }
          },
          payment: { select: { method: true } }
        }
      });

      if (fullBooking && fullBooking.bookerEmail) {
        const courtNames = [...new Set(
          fullBooking.items.map(item => item.timeSlot.court.name)
        )].join(', ');

        const slots = fullBooking.items.map(item => {
          const start = new Date(item.timeSlot.startTime);
          const end = new Date(item.timeSlot.endTime);
          return {
            date: start.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
          };
        });

        const emailData = {
          bookingId: fullBooking.id,
          bookerName: fullBooking.bookerName,
          bookerEmail: fullBooking.bookerEmail,
          bookingCode: fullBooking.bookingCode,
          clubName: fullBooking.club?.name || 'N/A',
          courtName: courtNames,
          slots,
          totalAmount: Number(fullBooking.totalAmount),
          discountAmount: Number(fullBooking.discountAmount),
          finalAmount: Number(fullBooking.finalAmount),
          paymentMethod: PAYMENT_METHOD_LABELS[fullBooking.payment?.method || ''] || fullBooking.payment?.method || 'N/A',
        };

        // Nếu là chuyển khoản, gửi hướng dẫn thanh toán. Nếu là tiền mặt, gửi xác nhận đặt chỗ.
        if (fullBooking.payment?.method === 'BANK_TRANSFER') {
           await sendBookingWaitingPaymentEmail(emailData);
        } else if (fullBooking.payment?.method === 'CASH') {
           // Tiền mặt có thể gửi ngay email đặt chỗ thành công (vì không online)
           await sendBookingConfirmationEmail(emailData);
        }
      }
    } catch (error) {
      console.error('⚠️ Lỗi khi gửi email khởi tạo booking:', error);
    }
  });

  /**
   * Listen for booking status changes
   */
  eventEmitter.on('booking.status_updated', async ({ clubId, booking, type }) => {
    // 1. Thông báo cho Owner dashboard (venue room)
    if (clubId) {
      await notifyNewBooking(clubId, {
        booking,
        type: type || 'booking-status-updated'
      });
    }

    // 2. Thông báo real-time cho khách hàng
    if (booking?.id) {
      notifyBookingStatusChanged(booking.id, {
        bookingId: booking.id,
        status: booking.status,
        type: type || 'booking-status-updated'
      });
    }

    // 3. Nếu trạng thái là CONFIRMED (thanh toán thành công) → Gửi email hóa đơn
    if (booking?.status === 'CONFIRMED') {
      try {
        await sendInvoice(booking.id);
      } catch (err) {
        console.error('⚠️ Lỗi khi gửi hóa đơn thanh toán:', err);
      }
    }
  });

  /**
   * Listen for cancellations
   */
  eventEmitter.on('booking.cancelled', async ({ clubId, booking }) => {
      if (clubId) {
        await notifyNewBooking(clubId, {
          booking,
          type: 'booking-cancelled'
        });
      }
  });
};

/**
 * Hàm hỗ trợ gửi email hóa đơn
 */
async function sendInvoice(bookingId: string) {
  const fullBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      club: { select: { name: true } },
      items: {
        include: {
          timeSlot: {
            include: { court: { select: { name: true } } }
          }
        }
      },
      payment: { select: { method: true } }
    }
  });

  if (fullBooking && fullBooking.bookerEmail) {
    const courtNames = [...new Set(
      fullBooking.items.map(item => item.timeSlot.court.name)
    )].join(', ');

    const slots = fullBooking.items.map(item => {
      const start = new Date(item.timeSlot.startTime);
      const end = new Date(item.timeSlot.endTime);
      return {
        date: start.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      };
    });

    await sendBookingConfirmationEmail({
      bookingId: fullBooking.id,
      bookerName: fullBooking.bookerName,
      bookerEmail: fullBooking.bookerEmail,
      bookingCode: fullBooking.bookingCode,
      clubName: fullBooking.club?.name || 'N/A',
      courtName: courtNames,
      slots,
      totalAmount: Number(fullBooking.totalAmount),
      discountAmount: Number(fullBooking.discountAmount),
      finalAmount: Number(fullBooking.finalAmount),
      paymentMethod: PAYMENT_METHOD_LABELS[fullBooking.payment?.method || ''] || fullBooking.payment?.method || 'N/A',
    });
  }
}
