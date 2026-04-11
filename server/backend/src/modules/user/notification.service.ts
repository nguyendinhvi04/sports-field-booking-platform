import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/generated/prisma";

/**
 * Lấy danh sách thông báo của user hiện tại
 */
export async function getMyNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50, // Limit to 50 latest
    include: {
      booking: {
        select: { id: true, bookingCode: true, status: true }
      }
    }
  });
}

/**
 * Đánh dấu một hoặc tất cả thông báo là đã đọc
 */
export async function markAsRead(userId: string, notificationId?: string) {
  if (notificationId) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() }
    });
  }

  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() }
  });
}

/**
 * Xóa thông báo
 */
export async function deleteNotification(userId: string, notificationId: string) {
  return prisma.notification.delete({
    where: { id: notificationId, userId }
  });
}

/**
 * Tạo thông báo (Hàm nội bộ cho các service khác gọi)
 */
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  bookingId?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      bookingId: data.bookingId
    }
  });
}

/**
 * Lấy số lượng thông báo chưa đọc
 */
export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false }
  });
}
