<template>
  <div class="playfinder-app">

    <!-- ANNOUNCEMENT BAR -->
    <div class="announcement-bar">
      <p>
        Các tính năng mới đã có mặt 🎉 Dễ dàng lặp lại, tùy chỉnh và quản lý các
        đặt chỗ của bạn !
        <a href="#">Tìm hiểu thêm »</a>
      </p>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main-container">
      <!-- RESULTS HEADER -->
      <div class="results-header">
        <p class="results-title">
          Có <strong>{{ venues.length }} địa điểm chơi</strong> cầu lông gần
          <strong>London</strong>, <strong>Anh.</strong>
        </p>
        <button class="map-btn">
          XEM BẢN ĐỒ
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
        </button>
      </div>

      <div class="content-layout">
        <!-- SIDEBAR FILTERS -->
        <BookingFilters
          v-model="filters"
          :booking-options="bookingOptions"
          :format-options="formatOptions"
          :surface-options="surfaceOptions"
          :radius-options="radiusOptions"
          :facility-options="facilityOptions"
        />

        <!-- VENUE CARDS -->
        <div class="venues-list">
          <!-- Online booking alert -->
          <div class="online-booking-alert">
            <span class="bolt">⚡</span>
            Hiện có 3 địa điểm có sân cầu lông cho phép đặt chỗ trực tuyến. Nhấp
            <a href="#">vào đây</a> để lọc các địa điểm đó.
          </div>

          <!-- Venue Card -->
          <VenueCard v-for="venue in venues" :key="venue.id" :venue="venue" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BookingFilters from "../../components/client/booking/BookingFilters.vue";
import VenueCard from "../../components/client/booking/VenueCard.vue";

export default {
  name: "BookingView",
  components: {
    BookingFilters,
    VenueCard,
  },
  data() {
    return {
      filters: {
        booking: [],
        byDate: false,
        format: [],
        surface: [],
        radius: "5",
        facility: [],
      },
      bookingOptions: [
        { value: "partner", label: "Đối tác Playfinder" },
        { value: "online", label: "Playfinder hợp tác với Online Booking." },
      ],
      formatOptions: [
        { value: "toa_an", label: "tòa án" },
        { value: "trong_nha", label: "trong nhà" },
      ],
      surfaceOptions: [
        { value: "phong_tap", label: "Phòng tập thể dục" },
        { value: "cung", label: "Cứng" },
        { value: "trong_nha", label: "Trong nhà" },
        { value: "nha_thi_dau", label: "Nhà thi đấu thể thao" },
      ],
      radiusOptions: [
        { value: "1", label: "Trong vòng 1 dặm" },
        { value: "3", label: "Trong vòng 3 dặm" },
        { value: "5", label: "Trong vòng 5 dặm" },
        { value: "10", label: "Trong vòng 10 dặm" },
        { value: "75", label: "Trong vòng 75 dặm" },
      ],
      facilityOptions: [
        { value: "phong_thay_do", label: "Phòng thay đồ" },
        { value: "do_xe", label: "Đỗ xe miễn phí" },
      ],
      venues: [
        {
          id: 1,
          name: "Trung tâm thể thao Mallinson",
          address: "Số 2 đường Bishopswood, Highgate, London",
          format: "Trong nhà",
          surface: "Sàn gỗ",
          type: "Tiêu chuẩn",
          distance: 1.2,
          changingRoom: true,
          freeParking: true,
          wifi: true,
          isPartner: true,
          hasOnlineBooking: true,
          hasSlider: true,
          availableSlots: "Còn 4 slot trống hôm nay",
          isPromo: false,
          price: 450000,
          rating: 4.8,
          reviewCount: 124,
          image: "https://images.unsplash.com/photo-1562552476-3f8e2f59a2b7?w=600&h=400&fit=crop",
        },
        {
          id: 2,
          name: "Sân vận động Pursley",
          address: "Đường Pursley, Mill Hill, London",
          format: "Ngoài trời",
          surface: "Cỏ nhân tạo",
          type: "Sân 7 người",
          distance: 3.9,
          changingRoom: true,
          freeParking: true,
          wifi: false,
          isPartner: true,
          hasOnlineBooking: true,
          hasSlider: true,
          availableSlots: "Còn 6 slot tối nay",
          isPromo: false,
          price: 350000,
          rating: 4.5,
          reviewCount: 89,
          image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&h=400&fit=crop",
        },
        {
          id: 3,
          name: "Đặc quyền Đối tác mới",
          address: "Sắp có mặt tại hệ thống",
          format: null,
          surface: null,
          type: null,
          distance: undefined,
          changingRoom: false,
          freeParking: false,
          isPartner: false,
          hasOnlineBooking: false,
          hasSlider: false,
          availableSlots: null,
          isPromo: true,
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
        },
      ],
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap");

.playfinder-app {
  font-family: "Barlow", sans-serif;
  font-size: 14px;
  color: #333;
  background: #f5f5f5;
  min-height: 100vh;
}


/* ─── ANNOUNCEMENT BAR ─── */
.announcement-bar {
  background: #0891b2;
  color: white;
  text-align: center;
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 500;
}

.announcement-bar a {
  color: white;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}

.announcement-bar a:hover {
  border-bottom-color: white;
}

/* ─── MAIN CONTAINER ─── */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
}

/* ─── RESULTS HEADER ─── */
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.results-title {
  font-size: 15px;
  color: #555;
}

.results-title strong {
  color: #222;
}

.map-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
  color: #222;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background 0.2s;
}

.map-btn:hover {
  background: #e8e8e8;
}

/* ─── CONTENT LAYOUT ─── */
.content-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  align-items: start;
}

/* ─── VENUES LIST ─── */
.venues-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ─── ONLINE BOOKING ALERT ─── */
.online-booking-alert {
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 13.5px;
  color: #555;
  line-height: 1.5;
}

.online-booking-alert a {
  color: #0891b2;
  font-weight: 600;
  text-decoration: underline;
}

.bolt {
  margin-right: 4px;
}

/* Responsive */
@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .navbar-right .nav-link:not(.nav-link--cta) {
    display: none;
  }
}
</style>