import { PrismaClient, VoucherType } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Vouchers...");

  // 1. Clean up existing vouchers
  await prisma.voucherUsage.deleteMany();
  await prisma.voucher.deleteMany();
  console.log("🗑 Existing vouchers cleared.");

  // 2. Create Global Vouchers (clubId: null)
  const vouchers = [
    {
      code: "GIAMGIA10",
      title: "Giảm 10k cho mọi đơn hàng",
      description: "Mã giảm giá áp dụng cho toàn hệ thống không giới hạn sân.",
      type: VoucherType.FIXED_AMOUNT,
      value: 10000,
      minOrderAmount: 50000,
      usageLimit: 1000,
      usagePerUser: 1,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
    },
    {
      code: "PROMO20K",
      title: "Ưu đãi 20k",
      description: "Giảm trực tiếp 20k cho đơn hàng từ 100k.",
      type: VoucherType.FIXED_AMOUNT,
      value: 20000,
      minOrderAmount: 100000,
      usageLimit: 500,
      usagePerUser: 1,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
    {
      code: "SPORTS10P",
      title: "Giảm 10% tổng hóa đơn",
      description: "Ưu đãi 10% cho mọi người chơi (Tối đa 50k).",
      type: VoucherType.PERCENTAGE,
      value: 10,
      minOrderAmount: 0,
      maxDiscount: 50000,
      usageLimit: 999,
      usagePerUser: 1,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
    {
        code: "SV2026",
        title: "Voucher Siêu Cấp 50%",
        description: "Giảm 50% cho ngày ra mắt ứng dụng (Tối đa 100k).",
        type: VoucherType.PERCENTAGE,
        value: 50,
        minOrderAmount: 0,
        maxDiscount: 100000,
        usageLimit: 100,
        usagePerUser: 1,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      }
  ];

  for (const v of vouchers) {
    await prisma.voucher.create({
      data: {
        ...v,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${vouchers.length} vouchers successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
