import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// 10 Câu lạc bộ tại Đà Nẵng (vị trí thực tế)
const danangClubs = [
  {
    name: 'Sân Bóng Đá Mini Hải Châu',
    slug: 'san-bong-da-mini-hai-chau',
    description: 'Sân bóng đá mini chất lượng cao ngay trung tâm quận Hải Châu, mặt cỏ nhân tạo thế hệ mới, hệ thống đèn LED chiếu sáng toàn sân.',
    address: '55 Nguyễn Văn Linh',
    ward: 'Nam Dương',
    district: 'Hải Châu',
    city: 'Đà Nẵng',
    latitude: 16.0544,
    longitude: 108.2022,
    phone: '0236 111 0001',
    sportType: 'FOOTBALL' as const,
    courts: ['Sân 5 số 1', 'Sân 5 số 2', 'Sân 7 số 1', 'Sân 7 số 2'],
    surfaces: ['Cỏ nhân tạo', 'Cỏ nhân tạo', 'Cỏ nhân tạo', 'Cỏ nhân tạo'],
    prices: [250000, 250000, 500000, 500000],
    peakPrices: [400000, 400000, 750000, 750000],
  },
  {
    name: 'CLB Cầu Lông Sơn Trà',
    slug: 'clb-cau-long-son-tra',
    description: 'Hệ thống 4 sân cầu lông tiêu chuẩn thi đấu tại Sơn Trà, sàn thảm Yonex cao cấp, mái che chống nắng hoàn toàn.',
    address: '120 Ngô Quyền',
    ward: 'An Hải Bắc',
    district: 'Sơn Trà',
    city: 'Đà Nẵng',
    latitude: 16.0778,
    longitude: 108.2287,
    phone: '0236 222 0002',
    sportType: 'BADMINTON' as const,
    courts: ['Sân Thảm A', 'Sân Thảm B', 'Sân Thảm C (VIP)', 'Sân Thảm D (VIP)'],
    surfaces: ['Thảm Yonex', 'Thảm Yonex', 'Thảm Yonex Pro', 'Thảm Yonex Pro'],
    prices: [80000, 80000, 120000, 120000],
    peakPrices: [100000, 100000, 150000, 150000],
  },
  {
    name: 'Tennis Club Đà Nẵng',
    slug: 'tennis-club-da-nang',
    description: 'Câu lạc bộ tennis đẳng cấp quốc tế với 4 sân Hard Court, phù hợp cho cả tập luyện và tổ chức giải đấu.',
    address: '25 Phan Đăng Lưu',
    ward: 'Hòa Cường Bắc',
    district: 'Hải Châu',
    city: 'Đà Nẵng',
    latitude: 16.0395,
    longitude: 108.2114,
    phone: '0236 333 0003',
    sportType: 'TENNIS' as const,
    courts: ['Sân Tennis A', 'Sân Tennis B', 'Sân Tennis C', 'Sân Center Court'],
    surfaces: ['Hard Court', 'Hard Court', 'Hard Court', 'Hard Court'],
    prices: [200000, 200000, 200000, 300000],
    peakPrices: [350000, 350000, 350000, 500000],
  },
  {
    name: 'Pickleball Arena Thanh Khê',
    slug: 'pickleball-arena-thanh-khe',
    description: 'Trung tâm Pickleball đầu tiên tại Đà Nẵng, sàn Acrylic tiêu chuẩn Mỹ, không gian thoáng mát và hiện đại.',
    address: '88 Điện Biên Phủ',
    ward: 'Chính Gián',
    district: 'Thanh Khê',
    city: 'Đà Nẵng',
    latitude: 16.0677,
    longitude: 108.1937,
    phone: '0236 444 0004',
    sportType: 'PICKLEBALL' as const,
    courts: ['Pickleball 01', 'Pickleball 02', 'Pickleball 03', 'Pickleball 04'],
    surfaces: ['Acrylic', 'Acrylic', 'Acrylic', 'Acrylic'],
    prices: [150000, 150000, 150000, 150000],
    peakPrices: [200000, 200000, 200000, 200000],
  },
  {
    name: 'Sân Bóng Rổ Liên Chiểu',
    slug: 'san-bong-ro-lien-chieu',
    description: 'Khu thể thao bóng rổ trong nhà hiện đại nhất Liên Chiểu, sàn gỗ đạt tiêu chuẩn FIBA, khán đài 200 chỗ ngồi.',
    address: '300 Nguyễn Lương Bằng',
    ward: 'Hòa Khánh Bắc',
    district: 'Liên Chiểu',
    city: 'Đà Nẵng',
    latitude: 16.0856,
    longitude: 108.1515,
    phone: '0236 555 0005',
    sportType: 'BASKETBALL' as const,
    courts: ['Full Court A', 'Full Court B', 'Half Court 1', 'Half Court 2'],
    surfaces: ['Sàn gỗ', 'Sàn gỗ', 'Sàn gỗ', 'Sàn gỗ'],
    prices: [400000, 400000, 250000, 250000],
    peakPrices: [600000, 600000, 350000, 350000],
  },
  {
    name: 'Sân Bóng Đá Ngũ Hành Sơn',
    slug: 'san-bong-ngu-hanh-son',
    description: 'Sân bóng đá cỏ nhân tạo view biển tuyệt đẹp tại Ngũ Hành Sơn, gần bãi biển Mỹ Khê, thích hợp cho các trận đấu giao hữu.',
    address: '40 Lê Văn Hiến',
    ward: 'Khuê Mỹ',
    district: 'Ngũ Hành Sơn',
    city: 'Đà Nẵng',
    latitude: 16.0206,
    longitude: 108.2401,
    phone: '0236 666 0006',
    sportType: 'FOOTBALL' as const,
    courts: ['Sân 5 A', 'Sân 5 B', 'Sân 7 Premium', 'Sân 11 người'],
    surfaces: ['Cỏ nhân tạo', 'Cỏ nhân tạo', 'Cỏ nhân tạo', 'Cỏ nhân tạo'],
    prices: [300000, 300000, 600000, 1200000],
    peakPrices: [450000, 450000, 900000, 1800000],
  },
  {
    name: 'Cầu Lông Cẩm Lệ Center',
    slug: 'cau-long-cam-le-center',
    description: 'Trung tâm cầu lông Cẩm Lệ phục vụ cộng đồng, giá cả phải chăng, sàn PVC chất lượng tốt, phù hợp mọi cấp độ.',
    address: '15 Cách Mạng Tháng Tám',
    ward: 'Khuê Trung',
    district: 'Cẩm Lệ',
    city: 'Đà Nẵng',
    latitude: 16.0200,
    longitude: 108.2050,
    phone: '0236 777 0007',
    sportType: 'BADMINTON' as const,
    courts: ['Sân PVC 1', 'Sân PVC 2', 'Sân PVC 3', 'Sân PVC 4'],
    surfaces: ['PVC', 'PVC', 'PVC', 'PVC'],
    prices: [60000, 60000, 60000, 60000],
    peakPrices: [80000, 80000, 80000, 80000],
  },
  {
    name: 'Bóng Chuyền Beach Club Mỹ Khê',
    slug: 'bong-chuyen-beach-club-my-khe',
    description: 'Sân bóng chuyền bãi biển ngay trên bờ biển Mỹ Khê huyền thoại, trải nghiệm thể thao kết hợp du lịch biển.',
    address: '1 Võ Nguyên Giáp',
    ward: 'Phước Mỹ',
    district: 'Sơn Trà',
    city: 'Đà Nẵng',
    latitude: 16.0595,
    longitude: 108.2477,
    phone: '0236 888 0008',
    sportType: 'VOLLEYBALL' as const,
    courts: ['Beach Court 1', 'Beach Court 2', 'Beach Court 3', 'Beach Court 4'],
    surfaces: ['Cát biển', 'Cát biển', 'Cát biển', 'Cát biển'],
    prices: [200000, 200000, 200000, 200000],
    peakPrices: [300000, 300000, 300000, 300000],
  },
  {
    name: 'Mega Sports Complex Hòa Xuân',
    slug: 'mega-sports-complex-hoa-xuan',
    description: 'Tổ hợp thể thao đa năng lớn nhất khu vực Hòa Xuân, bao gồm sân bóng đá, cầu lông và pickleball trong cùng một khuôn viên.',
    address: '200 Nguyễn Phước Lan',
    ward: 'Hòa Xuân',
    district: 'Cẩm Lệ',
    city: 'Đà Nẵng',
    latitude: 16.0092,
    longitude: 108.2213,
    phone: '0236 999 0009',
    sportType: 'FOOTBALL' as const,
    courts: ['Sân Futsal Premier', 'Sân 7 người Gold', 'Sân Pickleball Mix', 'Sân Cầu Lông Mix'],
    surfaces: ['Cỏ nhân tạo', 'Cỏ nhân tạo', 'Acrylic', 'Thảm Yonex'],
    sportTypes: ['FOOTBALL', 'FOOTBALL', 'PICKLEBALL', 'BADMINTON'] as const,
    prices: [280000, 550000, 140000, 90000],
    peakPrices: [420000, 800000, 180000, 110000],
  },
  {
    name: 'Tennis & Fitness Hải Châu Premium',
    slug: 'tennis-fitness-hai-chau-premium',
    description: 'Câu lạc bộ Tennis Premium kết hợp Fitness Center, phục vụ giới doanh nhân và người yêu thể thao tại trung tâm Đà Nẵng.',
    address: '68 Trần Phú',
    ward: 'Hải Châu 1',
    district: 'Hải Châu',
    city: 'Đà Nẵng',
    latitude: 16.0680,
    longitude: 108.2200,
    phone: '0236 100 0010',
    sportType: 'TENNIS' as const,
    courts: ['Grand Court 1', 'Grand Court 2', 'Training Court A', 'Training Court B'],
    surfaces: ['Hard Court', 'Hard Court', 'Clay', 'Clay'],
    prices: [250000, 250000, 180000, 180000],
    peakPrices: [450000, 450000, 300000, 300000],
  },
];

async function main() {
  console.log('🏙️ Bắt đầu nạp 10 Câu lạc bộ tại Đà Nẵng...\n');

  // Lấy danh sách owners thực tế từ DB
  const owners = await prisma.user.findMany({ 
    where: { role: 'OWNER' }, 
    take: 3,
    select: { id: true }
  });
  if (owners.length === 0) throw new Error("Chưa có chủ sân (OWNER) trong DB. Hãy chạy seed chính trước.");
  const ownerIds = owners.map(o => o.id);

  // Lấy các amenities thực tế từ DB
  const amenities = await prisma.amenity.findMany();
  const getAmenityId = (name: string) => amenities.find(a => a.name.toLowerCase().includes(name.toLowerCase()))?.id || amenities[0]?.id;

  const wifiId = getAmenityId('WiFi');
  const parkingId = getAmenityId('Bãi xe');
  const canteenId = getAmenityId('Căng tin');
  const showerId = getAmenityId('Phòng tắm');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  for (let i = 0; i < danangClubs.length; i++) {
    const c = danangClubs[i];
    console.log(`🏟️ [${i + 1}/10] Tạo CLB: ${c.name}`);

    // Tạo Club
    const club = await prisma.club.create({
      data: {
        ownerId: ownerIds[i % ownerIds.length],
        name: c.name,
        slug: c.slug,
        description: c.description,
        address: c.address,
        ward: c.ward,
        district: c.district,
        city: c.city,
        latitude: c.latitude,
        longitude: c.longitude,
        phone: c.phone,
        logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${c.slug}`,
        coverImageUrl: `https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&r=${i}`,
        approvalStatus: 'APPROVED',
        amenities: {
          create: [
            { amenityId: wifiId, price: 0 },
            { amenityId: parkingId, price: 5000 },
            { amenityId: showerId, price: 10000 },
            { amenityId: canteenId, price: 0 },
          ].slice(0, 2 + Math.floor(Math.random() * 3)), // Gán ngẫu nhiên 2-4 tiện ích
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

    // Tạo 4 Sân cho mỗi CLB
    for (let j = 0; j < 4; j++) {
      const sportType = (c as any).sportTypes ? (c as any).sportTypes[j] : c.sportType;
      
      const court = await prisma.court.create({
        data: {
          clubId: club.id,
          name: c.courts[j],
          sportType: sportType,
          surface: c.surfaces[j],
          indoorOutdoor: ['BADMINTON', 'BASKETBALL', 'PICKLEBALL'].includes(sportType) ? 'INDOOR' : 'OUTDOOR',
          sortOrder: j + 1,
          pricings: {
            create: [
              {
                startTime: new Date(1970, 0, 1, 6, 0),
                endTime: new Date(1970, 0, 1, 16, 0),
                pricePerHour: c.prices[j],
                label: 'Giờ thường',
              },
              {
                startTime: new Date(1970, 0, 1, 16, 0),
                endTime: new Date(1970, 0, 1, 23, 0),
                pricePerHour: c.peakPrices[j],
                label: 'Giờ cao điểm',
              },
            ],
          },
        },
      });

      // Tạo TimeSlots cho 3 ngày (hôm nay, ngày mai, ngày kia)
      for (const baseDate of [today, tomorrow, dayAfter]) {
        for (let hour = 6; hour < 23; hour++) {
          await prisma.timeSlot.create({
            data: {
              courtId: court.id,
              startTime: new Date(new Date(baseDate).setHours(hour, 0, 0, 0)),
              endTime: new Date(new Date(baseDate).setHours(hour + 1, 0, 0, 0)),
              status: 'AVAILABLE',
            },
          });
        }
      }

      console.log(`   ✅ Sân: ${c.courts[j]} (${sportType}) + 51 time slots`);
    }

    console.log(`   🎉 CLB ${c.name} hoàn tất!\n`);
  }

  console.log('✨ Hoàn tất nạp 10 CLB × 4 sân = 40 sân tại Đà Nẵng!');
  console.log('📊 Tổng TimeSlots mới: 40 sân × 17 slot/ngày × 3 ngày = 2040 slots');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
