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
      logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=ThanhDa",
      coverImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200",
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
      logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Q7Pro",
      coverImageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200",
      approvalStatus: "APPROVED",
      amenities: {
        create: [
          { amenityId: shower.id },
          { amenityId: canteen.id },
        ],
      },
      openingHours: {
        create: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
          dayOfWeek: day,
          openTime: new Date(1970, 0, 1, 5, 0),
          closeTime: new Date(1970, 0, 1, 22, 0),
        })),
      },
    },
  });

  const club3 = await prisma.club.create({
    data: {
      ownerId: owner1.id,
      name: "Tennis Thảo Điền Luxury",
      slug: "tennis-thao-dien-luxury",
      address: "24 Xuân Thủy",
      city: "Hồ Chí Minh",
      district: "Quận 2",
      logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=ThaoDien",
      coverImageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1200",
      approvalStatus: "APPROVED",
      amenities: {
        create: [
          { amenityId: wifi.id },
          { amenityId: parking.id },
          { amenityId: shower.id },
        ],
      },
      openingHours: {
        create: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
          dayOfWeek: day,
          openTime: new Date(1970, 0, 1, 6, 0),
          closeTime: new Date(1970, 0, 1, 21, 0),
        })),
      },
    },
  });

  const club4 = await prisma.club.create({
    data: {
      ownerId: owner2.id,
      name: "Trung Tâm Pickleball & Basketball",
      slug: "pickleball-basketball-center",
      address: "50 Lê Lợi",
      city: "Hồ Chí Minh",
      district: "Quận 1",
      logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=PBCenter",
      coverImageUrl: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1200",
      approvalStatus: "APPROVED",
      amenities: {
        create: [
          { amenityId: wifi.id },
          { amenityId: canteen.id },
        ],
      },
      openingHours: {
        create: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
          dayOfWeek: day,
          openTime: new Date(1970, 0, 1, 7, 0),
          closeTime: new Date(1970, 0, 1, 23, 0),
        })),
      },
    },
  });

  // 5. Create Courts & Pricing
  console.log("🏟 Creating courts and pricing...");
  
  // Football Courts
  const court1 = await prisma.court.create({
    data: {
      clubId: club1.id,
      name: "Sân 5 số 1 (Futsal)",
      sportType: "FOOTBALL",
      surface: "Cỏ nhân tạo",
      indoorOutdoor: "OUTDOOR",
      pricings: {
        create: [
          { startTime: new Date(1970, 0, 1, 6, 0), endTime: new Date(1970, 0, 1, 16, 0), pricePerHour: 200000, label: "Giờ thường" },
          { startTime: new Date(1970, 0, 1, 16, 0), endTime: new Date(1970, 0, 1, 23, 0), pricePerHour: 350000, label: "Giờ cao điểm" },
        ],
      },
    },
  });

  const courtF2 = await prisma.court.create({
    data: {
      clubId: club1.id,
      name: "Sân 7 số 1",
      sportType: "FOOTBALL",
      surface: "Cỏ nhân tạo",
      indoorOutdoor: "OUTDOOR",
      pricings: {
        create: [
          { startTime: new Date(1970, 0, 1, 6, 0), endTime: new Date(1970, 0, 1, 16, 0), pricePerHour: 500000, label: "Giờ thường" },
          { startTime: new Date(1970, 0, 1, 16, 0), endTime: new Date(1970, 0, 1, 23, 0), pricePerHour: 800000, label: "Giờ cao điểm" },
        ],
      },
    },
  });

  // Badminton Courts
  const court2 = await prisma.court.create({
    data: {
      clubId: club2.id,
      name: "Sân Thảm 1",
      sportType: "BADMINTON",
      surface: "Sàn gỗ",
      indoorOutdoor: "INDOOR",
      pricings: {
        create: [
          { startTime: new Date(1970, 0, 1, 0, 0), endTime: new Date(1970, 0, 1, 24, 0), pricePerHour: 90000, label: "Đồng giá" },
        ],
      },
    },
  });

  const courtB2 = await prisma.court.create({
    data: {
      clubId: club2.id,
      name: "Sân Thảm 2 (VIP)",
      sportType: "BADMINTON",
      surface: "Thảm Yonex",
      indoorOutdoor: "INDOOR",
      pricings: {
        create: [
          { startTime: new Date(1970, 0, 1, 0, 0), endTime: new Date(1970, 0, 1, 24, 0), pricePerHour: 120000, label: "Đồng giá" },
        ],
      },
    },
  });

  // Tennis Courts
  const courtT1 = await prisma.court.create({
    data: {
      clubId: club3.id,
      name: "Sân Tennis A",
      sportType: "TENNIS",
      surface: "Hard Court",
      indoorOutdoor: "OUTDOOR",
      pricings: {
        create: [
          { startTime: new Date(1970, 0, 1, 6, 0), endTime: new Date(1970, 0, 1, 17, 0), pricePerHour: 200000, label: "Giờ sáng" },
          { startTime: new Date(1970, 0, 1, 17, 0), endTime: new Date(1970, 0, 1, 22, 0), pricePerHour: 400000, label: "Giờ đèn" },
        ],
      },
    },
  });

  // Pickleball Courts
  const courtP1 = await prisma.court.create({
    data: {
      clubId: club4.id,
      name: "Pickleball 01",
      sportType: "PICKLEBALL",
      surface: "Acrylic",
      indoorOutdoor: "INDOOR",
      pricings: {
        create: [
          { startTime: new Date(1970, 0, 1, 0, 0), endTime: new Date(1970, 0, 1, 24, 0), pricePerHour: 150000, label: "Đồng giá" },
        ],
      },
    },
  });

  // Basketball Courts
  const courtBB1 = await prisma.court.create({
    data: {
      clubId: club4.id,
      name: "Sân Bóng Rổ Trong Nhà",
      sportType: "BASKETBALL",
      surface: "Sàn gỗ xi bóng",
      indoorOutdoor: "INDOOR",
      pricings: {
        create: [
          { startTime: new Date(1970, 0, 1, 0, 0), endTime: new Date(1970, 0, 1, 24, 0), pricePerHour: 400000, label: "Thuê trọn sân" },
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

  async function createSlots(courtId: string, baseDate: Date, startHour = 6, endHour = 22) {
    for (let hour = startHour; hour < endHour; hour++) {
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

  const allCourtIds = [court1.id, courtF2.id, court2.id, courtB2.id, courtT1.id, courtP1.id, courtBB1.id];
  
  for (const id of allCourtIds) {
    await createSlots(id, today);
    await createSlots(id, tomorrow);
  }

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
