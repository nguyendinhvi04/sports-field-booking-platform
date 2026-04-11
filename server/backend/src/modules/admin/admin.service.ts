import { prisma } from "@/lib/prisma";
import { ApprovalStatus, CourtStatus } from "@/generated/prisma";
import { notifyNewBooking } from "@/lib/socket";

/**
 * Lấy danh sách tất cả các câu lạc bộ và sân chi tiết (Dành cho Admin)
 */
export async function getAllClubsAdmin() {
  return prisma.club.findMany({
    include: {
      owner: {
        select: {
          fullName: true,
          phone: true,
          email: true,
        }
      },
      images: {
        select: {
          url: true,
        }
      },
      courts: {
        select: {
          id: true,
          name: true,
          sportType: true,
          status: true,
          capacity: true,
          surface: true,
          images: {
            select: {
              url: true,
            }
          },
          pricings: true,
        }
      },
      _count: {
        select: {
          courts: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  });
}

/**
 * Duyệt hoặc từ chối một câu lạc bộ
 */
export async function updateClubApprovalStatus(clubId: string, status: ApprovalStatus) {
  const updatedClub = await prisma.club.update({
    where: { id: clubId },
    data: {
      approvalStatus: status,
      // Nếu duyệt thì mặc định active luôn
      isActive: status === ApprovalStatus.APPROVED,
    }
  });

  // Notify if the club's approval or status might affect availability
  notifyNewBooking(clubId, {
    club: updatedClub,
    type: `club-approval-${status.toLowerCase()}`
  });

  return updatedClub;
}

/**
 * Khóa hoặc mở khóa một câu lạc bộ (và tất cả sân thuộc nó)
 */
export async function toggleClubActiveStatus(clubId: string, isActive: boolean) {
  return prisma.$transaction(async (tx) => {
    // 1. Cập nhật CLB
    const club = await tx.club.update({
      where: { id: clubId },
      data: { isActive }
    });

    // 2. Cập nhật tất cả sân của CLB đó tương ứng
    await tx.court.updateMany({
      where: { clubId },
      data: {
        status: isActive ? CourtStatus.ACTIVE : CourtStatus.SUSPENDED
      }
    });

    // Notify update
    notifyNewBooking(clubId, {
      club,
      type: `club-toggled-${isActive ? 'active' : 'inactive'}`
    });

    return club;
  });
}

/**
 * Khóa hoặc mở khóa một sân đơn lẻ
 */
export async function toggleCourtStatus(courtId: string, status: CourtStatus) {
  return prisma.court.update({
    where: { id: courtId },
    data: { status }
  });
}

/**
 * Lấy danh sách hồ sơ KYC của Owner đang chờ duyệt
 */
export async function getAllOwnerKYCAdmin() {
  return prisma.ownerProfile.findMany({
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          ownedClubs: {
            select: {
              id: true,
              name: true,
              approvalStatus: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Lấy danh sách tất cả các chủ sở hữu (Owners) và hồ sơ đi kèm
 */
export async function getAllOwnersAdmin() {
  return prisma.ownerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isActive: true,
          ownedClubs: {
            include: {
              images: { select: { url: true }, take: 1 }
            }
          },
          _count: {
             select: { ownedClubs: true }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Duyệt hoặc từ chối KYC của Owner
 */
export async function updateOwnerKYCStatus(profileId: string, status: ApprovalStatus, note?: string) {
  return prisma.ownerProfile.update({
    where: { id: profileId },
    data: {
      kycStatus: status,
      kycNote: note,
      kycReviewedAt: new Date(),
    }
  });
}

/**
 * Lấy số liệu tổng quan (Counts) cho Admin Sidebar/Dashboard
 */
export async function getAdminSummary(startDate?: string, endDate?: string) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.setHours(0, 0, 0, 0));
  const end = endDate ? new Date(endDate) : new Date();

  const [pendingClubs, pendingKyc, totalUsers, activeClubs, totalBookings, filteredBookings, filteredRevenue] = await Promise.all([
    prisma.club.count({ where: { approvalStatus: ApprovalStatus.PENDING } }),
    prisma.ownerProfile.count({ where: { kycStatus: ApprovalStatus.PENDING } }),
    prisma.user.count(),
    prisma.club.count({ where: { approvalStatus: ApprovalStatus.APPROVED, isActive: true } }),
    prisma.booking.count(),
    prisma.booking.count({
      where: {
        createdAt: { gte: start, lte: end }
      }
    }),
    prisma.booking.aggregate({
      where: { 
        status: 'CONFIRMED',
        createdAt: { gte: start, lte: end }
      },
      _sum: { finalAmount: true }
    })
  ]);

  return {
    pendingClubs,
    pendingKyc,
    totalUsers,
    activeClubs,
    totalBookings,
    todayBookings: filteredBookings, // Đặt là filteredBookings nếu có filter
    totalRevenue: Number(filteredRevenue._sum.finalAmount || 0),
    violations: 4, 
  };
}

/**
 * Lấy thống kê số lượng đơn đặt sân theo tháng (6 tháng gần nhất)
 */
export async function getMonthlyStatsAdmin() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // Group by tháng dùng Raw Query để lấy đúng định dạng trên DB
  const stats = await prisma.$queryRaw`
    SELECT 
      TO_CHAR(date_trunc('month', "createdAt"), 'MM/YYYY') as month,
      COUNT(id)::int as count
    FROM bookings
    WHERE "createdAt" >= ${sixMonthsAgo}
    GROUP BY month
    ORDER BY MIN("createdAt") ASC
  `;

  return stats;
}

/**
 * Lấy danh sách tất cả người dùng (Admin)
 */
export async function getAllUsersAdmin() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
          ownedClubs: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  });
}

/**
 * Khóa hoặc mở khóa một tài khoản người dùng
 */
export async function toggleUserActiveStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive }
  });
}
