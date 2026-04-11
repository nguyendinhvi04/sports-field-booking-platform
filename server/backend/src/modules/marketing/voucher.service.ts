import { prisma } from "@/lib/prisma";

/**
 * Lấy danh sách voucher khả dụng của hệ thống và của CLB cụ thể (nếu có)
 * Một voucher khả dụng khi: Còn hạn dùng, đã được kích hoạt, chưa hết lượt dùng tổng thể.
 */
export async function getAvailableVouchers(userId: string, clubId?: string) {
  const vouchers = await prisma.voucher.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
      OR: [
        { clubId: null }, // Toàn hệ thống
        ...(clubId ? [{ clubId }] : []) // Voucher của riêng CLB
      ]
    },
    include: {
      usages: {
        where: { userId }
      }
    },
    orderBy: { endDate: 'asc' }
  });

  // Lọc thêm: Chỉ lấy voucher chưa hết lượt dùng tổng và user chưa dùng quá giới hạn
  return vouchers.filter((v) => {
    // 1. Kiểm tra giới hạn dùng tổng thể của voucher
    if (v.usageLimit && v.usedCount >= v.usageLimit) return false;
    
    // 2. Kiểm tra giới hạn dùng của user cụ thể (usagePerUser)
    if (v.usages.length >= v.usagePerUser) return false;

    return true;
  });
}

/**
 * Kiểm tra xem một voucher có hợp lệ cho một đơn hàng cụ thể không
 */
export async function validateVoucher(code: string, userId: string, clubId: string, orderAmount: number) {
  const voucher = await prisma.voucher.findFirst({
    where: { code, isActive: true },
    include: { usages: { where: { userId } } }
  });

  if (!voucher) throw new Error("VOUCHER_NOT_FOUND");

  // Kiểm tra thời hạn
  const now = new Date();
  if (voucher.startDate > now || voucher.endDate < now) {
    throw new Error("VOUCHER_EXPIRED");
  }

  // Kiểm tra phạm vi
  if (voucher.clubId && voucher.clubId !== clubId) {
    throw new Error("VOUCHER_INVALID_FOR_THIS_CLUB");
  }

  // Kiểm tra lượt dùng tổng
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    throw new Error("VOUCHER_OUT_OF_STOCK");
  }

  // Kiểm tra giới hạn dùng mỗi user
  if (voucher.usages.length >= voucher.usagePerUser) {
    throw new Error("VOUCHER_LIMIT_EXCEEDED");
  }

  // Kiểm tra đơn hàng tối thiểu
  if (voucher.minOrderAmount && orderAmount < Number(voucher.minOrderAmount)) {
    throw new Error(`ORDER_AMOUNT_TOO_LOW_MIN_${voucher.minOrderAmount}`);
  }

  return voucher;
}

/**
 * Lấy danh sách voucher đã nhận của người dùng (nếu có logic thu thập)
 * Ở đây có thể hiểu là danh sách voucher khả dụng (như hàm trên)
 */
export async function getMyVouchers(userId: string) {
  // Thực tế có thể có bảng UserVoucher riêng nếu muốn user "lưu" voucher, 
  // nhưng hiện tại mock qua việc lấy tất cả voucher khả dụng trong hệ thống.
  return getAvailableVouchers(userId);
}
