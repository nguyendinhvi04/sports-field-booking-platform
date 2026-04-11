import { prisma } from "@/lib/prisma";

/**
 * Toggle (thêm hoặc xóa khỏi yêu thích) một Cơ sở (Club) hoặc Sân (Court)
 */
export async function toggleFavorite(userId: string, target: { clubId?: string; courtId?: string }) {
  const { clubId, courtId } = target;

  if (clubId) {
    const existing = await prisma.favoriteClub.findUnique({
      where: { userId_clubId: { userId, clubId } }
    });

    if (existing) {
      return prisma.favoriteClub.delete({
        where: { userId_clubId: { userId, clubId } }
      });
    }

    return prisma.favoriteClub.create({
      data: { userId, clubId }
    });
  }

  if (courtId) {
    const existing = await prisma.favoriteCourt.findUnique({
      where: { userId_courtId: { userId, courtId } }
    });

    if (existing) {
      return prisma.favoriteCourt.delete({
        where: { userId_courtId: { userId, courtId } }
      });
    }

    return prisma.favoriteCourt.create({
      data: { userId, courtId }
    });
  }

  throw new Error("MISSING_TARGET_ID");
}

/**
 * Lấy danh sách yêu thích của User hiện tại
 */
export async function getMyFavorites(userId: string) {
  const [clubs, courts] = await Promise.all([
    prisma.favoriteClub.findMany({
      where: { userId },
      include: {
        club: {
          include: {
            images: { take: 1 },
            courts: { select: { sportType: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.favoriteCourt.findMany({
      where: { userId },
      include: {
        court: {
          include: {
            club: { select: { id: true, name: true, slug: true, address: true, logoUrl: true } },
            images: { take: 1 }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    clubs: clubs.map(f => f.club),
    courts: courts.map(f => f.court)
  };
}

/**
 * Kiểm tra xem một cơ sở/sân có đang được yêu thích hay không
 */
export async function isFavorite(userId: string, target: { clubId?: string; courtId?: string }) {
  const { clubId, courtId } = target;

  if (clubId) {
    const count = await prisma.favoriteClub.count({ where: { userId, clubId } });
    return count > 0;
  }

  if (courtId) {
    const count = await prisma.favoriteCourt.count({ where: { userId, courtId } });
    return count > 0;
  }

  return false;
}
