import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Clean up existing data (Order matters)
  console.log("🗑 Cleaning up database...");
  await prisma.clubCustomer.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.courtPricing.deleteMany();
  await prisma.courtImage.deleteMany();
  await prisma.court.deleteMany();
  await prisma.clubAmenity.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.openingHour.deleteMany();
  await prisma.clubImage.deleteMany();
  await prisma.club.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Amenities
  console.log("➕ Creating amenities...");
  const wifi = await prisma.amenity.create({ data: { name: "WiFi", icon: "wifi" } });
  const parking = await prisma.amenity.create({ data: { name: "Bãi xe", icon: "car" } });
  const canteen = await prisma.amenity.create({ data: { name: "Căng tin", icon: "utensils" } });
  const shower = await prisma.amenity.create({ data: { name: "Phòng tắm", icon: "shower" } });

  // 3. Create Users
  console.log("👤 Creating users...");
  const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@sportplatform.com",
      fullName: "Hệ thống Admin",
      passwordHash: hashedPassword,
      role: "ADMIN",
      profile: { create: { bio: "Quản trị viên hệ thống" } },
    },
  });

  // Owners
  const owner1 = await prisma.user.create({
    data: {
      email: "owner1@gmail.com",
      phone: "0911111111",
      fullName: "Trần Văn Chủ",
      passwordHash: hashedPassword,
      role: "OWNER",
      profile: { create: { address: "123 Quận 1, TP.HCM" } },
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: "owner2@gmail.com",
      phone: "0922222222",
      fullName: "Lê Thị Sân",
      passwordHash: hashedPassword,
      role: "OWNER",
      profile: { create: { address: "456 Quận 7, TP.HCM" } },
    },
  });

  // Regular Users
  const user1 = await prisma.user.create({
    data: {
      email: "user1@gmail.com",
      phone: "0933333333",
      fullName: "Nguyễn Văn Người Chơi",
      passwordHash: hashedPassword,
      role: "USER",
      profile: { create: { address: "789 Quận Bình Thạnh" } },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user2@gmail.com",
      phone: "0944444444",
      fullName: "Phạm Thị Khách Hàng",
      passwordHash: hashedPassword,
      role: "USER",
      profile: { create: { address: "101 Quận 2" } },
    },
  });

  // 4. Create Clubs
  console.log("🏢 Creating clubs...");
  const club1 = await prisma.club.create({
    data: {
      ownerId: owner1.id,
      name: "Sân Bóng Thanh Đa Super",
      slug: "san-bong-thanh-da-super",
      address: "15 Thanh Đa",
      city: "Hồ Chí Minh",
      district: "Bình Thạnh",
      approvalStatus: "APPROVED",
      amenities: {
        create: [
          { amenityId: wifi.id, note: "Sóng mạnh" },
          { amenityId: parking.id },
        ],
      },
      openingHours: {
        create: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
          dayOfWeek: day,
          openTime: new Date(1970, 0, 1, 6, 0),
          closeTime: new Date(1970, 0, 1, 23, 0),
        })),
      },
    },
  });

  const club2 = await prisma.club.create({
    data: {
      ownerId: owner2.id,
      name: "Cầu Lông Quận 7 Pro",
      slug: "cau-long-quan-7-pro",
      address: "100 Huỳnh Tấn Phát",
      city: "Hồ Chí Minh",
      district: "Quận 7",
      approvalStatus: "APPROVED",
      amenities: {
        create: [
          { amenityId: shower.id },
          { amenityId: canteen.id },
        ],
      },
    },
  });

  // 5. Create Courts & Pricing
  console.log("🏟 Creating courts and pricing...");
  // Court 1
  const court1 = await prisma.court.create({
    data: {
      clubId: club1.id,
      name: "Sân 5 số 1",
      sportType: "FOOTBALL",
      surface: "Cỏ nhân tạo",
      pricings: {
        create: [
          { startTime: new Date(1970, 0, 1, 6, 0), endTime: new Date(1970, 0, 1, 17, 0), pricePerHour: 250000, label: "Giờ sáng" },
          { startTime: new Date(1970, 0, 1, 17, 0), endTime: new Date(1970, 0, 1, 23, 0), pricePerHour: 450000, label: "Giờ vàng" },
        ],
      },
    },
  });

  // Court 2 (Badminton)
  const court2 = await prisma.court.create({
    data: {
      clubId: club2.id,
      name: "Sân Thảm 1",
      sportType: "BADMINTON",
      surface: "Sàn gỗ",
      pricings: {
        create: [
          { startTime: new Date(1970, 0, 1, 0, 0), endTime: new Date(1970, 0, 1, 24, 0), pricePerHour: 80000, label: "Đồng giá" },
        ],
      },
    },
  });

  // 6. Create TimeSlots for today and tomorrow
  console.log("⏰ Creating time slots...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  async function createSlots(courtId: string, baseDate: Date) {
    for (let hour = 6; hour < 22; hour++) {
      await prisma.timeSlot.create({
        data: {
          courtId,
          startTime: new Date(new Date(baseDate).setHours(hour, 0, 0, 0)),
          endTime: new Date(new Date(baseDate).setHours(hour + 1, 0, 0, 0)),
          status: "AVAILABLE",
        },
      });
    }
  }

  await createSlots(court1.id, today);
  await createSlots(court1.id, tomorrow);
  await createSlots(court2.id, today);

  // 7. Seed CRM data (ClubCustomer)
  console.log("💎 Seeding CRM data...");
  await prisma.clubCustomer.create({
    data: {
      clubId: club1.id,
      userId: user1.id,
      tier: "GOLD",
      totalBookings: 15,
      totalSpent: 4500000,
      notes: "Khách VIP, thích chọn sân số 1",
    },
  });

  await prisma.clubCustomer.create({
    data: {
      clubId: club1.id,
      userId: user2.id,
      tier: "NORMAL",
      totalBookings: 2,
      totalSpent: 600000,
      notes: "Cần chú ý lịch đặt giờ vàng",
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
