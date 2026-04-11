import { prisma } from "@/lib/prisma";

/**
 * Tạo đánh giá mới (Chỉ áp dụng cho đơn đã hoàn thành COMPLETED)
 */
export async function createReview(userId: string, data: {
  bookingId: string;
  rating: number;
  comment?: string;
  imageUrls?: string[];
}) {
  // 1. Kiểm tra booking có thuộc user và đã COMPLETED chưa
  const booking = await prisma.booking.findFirst({
    where: { 
      id: data.bookingId, 
      userId,
      status: "COMPLETED"
    },
    include: {
      items: {
        select: { timeSlot: { select: { courtId: true } } }
      }
    }
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND_OR_NOT_COMPLETED");
  }

  // 2. Kiểm tra xem đã review chưa (Unique constraint bookingId)
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId }
  });
  if (existingReview) {
    throw new Error("ALREADY_REVIEWED");
  }

  // Lấy courtId từ item đầu tiên để gắn vào review (nếu có)
  const courtId = booking.items[0]?.timeSlot.courtId;

  // 3. Tạo review trong transaction
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        userId,
        bookingId: data.bookingId,
        courtId,
        clubId: booking.clubId,
        rating: data.rating,
        comment: data.comment,
        images: {
          create: data.imageUrls?.map((url, index) => ({
            url,
            sortOrder: index
          }))
        }
      },
      include: {
        images: true,
        user: {
          select: { fullName: true, avatarUrl: true }
        }
      }
    });

    return review;
  });
}

/**
 * Lấy danh sách đánh giá của một CLB
 */
export async function getReviewsByClubId(clubId: string) {
  return prisma.review.findMany({
    where: { clubId, isVisible: true },
    include: {
      images: true,
      user: {
        select: { fullName: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Tính toán điểm đánh giá trung bình cho một CLB
 */
export async function getAverageRating(clubId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { clubId, isVisible: true },
    _avg: {
      rating: true
    },
    _count: {
      id: true
    }
  });

  return {
    averageRating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0,
    totalReviews: aggregate._count.id
  };
}
