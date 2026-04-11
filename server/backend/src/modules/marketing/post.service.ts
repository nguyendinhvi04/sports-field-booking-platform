import { prisma } from "@/lib/prisma";
import { PostType, Prisma } from "@/generated/prisma";

/**
 * Tạo bài đăng mới lên Bảng tin (News Feed)
 */
export async function createPost(clubId: string, ownerId: string, data: {
  type: PostType;
  title: string;
  content: string;
  imageUrl?: string;
  linkedCourtId?: string;
  linkedDate?: Date;
  expiresAt?: Date;
}) {
  // 1. Kiểm tra quyền sở hữu CLB
  const club = await prisma.club.findFirst({
    where: { id: clubId, ownerId }
  });
  if (!club) throw new Error("CLUB_NOT_FOUND_OR_UNAUTHORIZED");

  // 2. Tạo bài đăng
  return prisma.post.create({
    data: {
      clubId,
      type: data.type,
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
      linkedCourtId: data.linkedCourtId,
      linkedDate: data.linkedDate,
      expiresAt: data.expiresAt
    }
  });
}

/**
 * Lấy danh sách bài đăng (Dùng cho cả User và Owner)
 * User: Tự động ẩn bài khi sân liên quan đã được đặt hoặc hết hạn
 */
export async function getPosts(filters: { clubId?: string; type?: PostType; isUser?: boolean }) {
  const where: Prisma.PostWhereInput = {
    status: "ACTIVE",
    ...(filters.clubId && { clubId: filters.clubId }),
    ...(filters.type && { type: filters.type }),
    OR: [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } }
    ]
  };

  const posts = await prisma.post.findMany({
    where,
    include: {
      club: {
        select: { name: true, logoUrl: true, address: true, slug: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!filters.isUser) return posts;

  // Logic cho User: Kiểm tra tính khả dụng của sân được liên kết (nếu có)
  const processedPosts = [];
  for (const post of posts) {
    if (post.linkedCourtId && post.linkedDate) {
      // Kiểm tra xem tại ngày đó, sân đó có còn slot trống nào không
      const availableCount = await prisma.timeSlot.count({
        where: {
          courtId: post.linkedCourtId,
          startTime: {
            gte: new Date(new Date(post.linkedDate).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(post.linkedDate).setHours(23, 59, 59, 999))
          },
          status: "AVAILABLE"
        }
      });

      // Nếu không còn slot trống nào trong ngày đã đăng -> Ẩn bài đăng này đối với User
      if (availableCount === 0) continue;
    }
    processedPosts.push(post);
  }

  return processedPosts;
}

/**
 * Xóa bài đăng
 */
export async function deletePost(postId: string, ownerId: string) {
  const post = await prisma.post.findFirst({
    where: { id: postId, club: { ownerId } }
  });

  if (!post) throw new Error("POST_NOT_FOUND_OR_UNAUTHORIZED");

  return prisma.post.delete({
    where: { id: postId }
  });
}
