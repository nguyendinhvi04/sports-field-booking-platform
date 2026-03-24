<template>
  <div class="venue-detail-page">
    <!-- HERO SECTION -->
    <section class="venue-hero" :style="{ backgroundImage: `url(${venue.image})` }">
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <div class="breadcrumb">
          <router-link to="/">Trang chủ</router-link>
          <span class="sep">/</span>
          <router-link to="/booking">Danh sách sân</router-link>
          <span class="sep">/</span>
          <span class="current">{{ venue.name }}</span>
        </div>
        
        <div class="hero-info">
          <div class="venue-badges">
            <span v-if="venue.isPartner" class="badge-partner">CLB ĐỐI TÁC</span>
            <span class="badge-type">{{ venue.sportType === 'FOOTBALL' ? 'Bóng đá' : 'Cầu lông' }}</span>
          </div>
          <h1 class="venue-name">{{ venue.name }}</h1>
          <p class="venue-address">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {{ venue.address }}
          </p>
        </div>
      </div>
    </section>

    <!-- CONTENT SECTION -->
    <div class="container main-layout">
      <div class="row">
        <!-- LEFT: INFO & BOOKING -->
        <div class="col-lg-8">
          <!-- NAVIGATION TABS -->
          <div class="venue-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              class="tab-btn"
              :class="{ 'tab-btn--active': activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content card shadow-sm mb-4">
            <!-- BOOKING TAB -->
            <div v-if="activeTab === 'booking'" class="card-body p-4">
              <h4 class="section-title mb-4">Chọn giờ đặt sân</h4>
              
              <!-- DATE SELECTOR -->
              <div class="date-selector mb-4">
                <div 
                  v-for="date in nextSevenDays" 
                  :key="date.full"
                  class="date-item"
                  :class="{ 'date-item--active': selectedDate === date.full }"
                  @click="selectedDate = date.full"
                >
                  <span class="day-name">{{ date.dayName }}</span>
                  <span class="day-number">{{ date.dayNumber }}</span>
                  <span class="month-name">Th.{{ date.month }}</span>
                </div>
              </div>

              <!-- COURT SELECTOR (If multiple courts) -->
              <div class="court-select mb-4">
                <label class="form-label fw-bold small text-uppercase text-muted">Chọn sân</label>
                <div class="court-chips">
                  <button 
                    v-for="court in venue.courts" 
                    :key="court.id"
                    class="court-chip"
                    :class="{ 'court-chip--active': selectedCourtId === court.id }"
                    @click="selectedCourtId = court.id"
                  >
                    {{ court.name }}
                    <span class="court-price">{{ formatPrice(court.basePrice) }}/h</span>
                  </button>
                </div>
              </div>

              <!-- TIME SLOTS GRID -->
              <div class="time-slots-container">
                <div class="slots-header">
                  <div class="legend">
                    <span class="legend-item"><span class="box available"></span> Trống</span>
                    <span class="legend-item"><span class="box selected"></span> Đang chọn</span>
                    <span class="legend-item"><span class="box booked"></span> Đã đặt</span>
                  </div>
                </div>

                <div class="time-grid">
                  <div 
                    v-for="slot in filteredSlots" 
                    :key="slot.id"
                    class="time-slot"
                    :class="{ 
                      'time-slot--booked': slot.status === 'BOOKED',
                      'time-slot--selected': isSelected(slot),
                      'time-slot--disabled': slot.status === 'LOCKED'
                    }"
                    @click="toggleSlot(slot)"
                  >
                    <span class="slot-time">{{ slot.time }}</span>
                    <span class="slot-price">{{ formatPrice(slot.price) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- INFO TAB -->
            <div v-if="activeTab === 'info'" class="card-body p-4">
              <h4 class="section-title mb-3">Giới thiệu về {{ venue.name }}</h4>
              <p class="text-muted mb-4">{{ venue.description }}</p>
              
              <h5 class="fw-bold mb-3">Tiện ích sân</h5>
              <div class="amenities-grid">
                <div v-for="amenity in venue.amenities" :key="amenity.id" class="amenity-item">
                  <div class="amenity-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span class="amenity-name">{{ amenity.name }}</span>
                </div>
              </div>

              <h5 class="fw-bold mt-4 mb-3">Giờ mở cửa</h5>
              <ul class="list-unstyled opening-hours">
                <li v-for="day in venue.openingHours" :key="day.day" class="d-flex justify-content-between mb-2">
                  <span>{{ day.day }}</span>
                  <span class="fw-medium">{{ day.isClosed ? 'Đóng cửa' : `${day.open} - ${day.close}` }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- RIGHT: BOOKING SUMMARY -->
        <div class="col-lg-4">
          <div class="booking-summary card shadow-sm sticky-top" style="top: 100px; z-index: 100;">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-bold">Chi tiết đặt sân</h5>
            </div>
            <div class="card-body">
              <div v-if="selectedSlots.length === 0" class="empty-state text-center py-4">
                <div class="empty-icon mb-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <p class="text-muted small">Vui lòng chọn khung giờ bạn muốn đặt</p>
              </div>

              <div v-else class="selected-items">
                <div class="summary-info mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted small">Ngày đặt:</span>
                    <span class="fw-bold small">{{ selectedDateFormatted }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted small">Sân:</span>
                    <span class="fw-bold small">{{ selectedCourtName }}</span>
                  </div>
                </div>

                <div class="slots-list mb-3">
                  <div v-for="slot in selectedSlots" :key="slot.id" class="slot-item-summary">
                    <span class="slot-time">{{ slot.time }}</span>
                    <span class="slot-dots"></span>
                    <span class="slot-price">{{ formatPrice(slot.price) }}</span>
                    <button class="remove-slot" @click="toggleSlot(slot)">×</button>
                  </div>
                </div>

                <div class="divider my-3"></div>

                <div class="d-flex justify-content-between mb-4">
                  <h5 class="fw-bold mb-0">Tổng cộng</h5>
                  <h5 class="fw-bold text-success mb-0">{{ formatPrice(totalPrice) }}</h5>
                </div>

                <button class="btn btn-success w-100 py-3 fw-bold cta-submit" @click="handleBooking">
                  TIẾP TỤC ĐẶT SÂN
                </button>
                <p class="text-center text-muted small mt-3">
                  Không áp dụng hoàn tiền sau khi đã xác nhận đặt chỗ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VenueDetailView",
  data() {
    return {
      activeTab: 'booking',
      tabs: [
        { id: 'booking', label: 'Đặt sân' },
        { id: 'info', label: 'Thông tin sân' },
        { id: 'review', label: 'Đánh giá (0)' }
      ],
      selectedDate: null,
      selectedCourtId: null,
      selectedSlots: [],
      venue: {
        id: 'v1',
        name: 'Sân bóng đá cỏ nhân tạo Thành Phát',
        address: 'Số 2 Đ. Hoàng Minh Giám, Trung Hòa, Cầu Giấy, Hà Nội',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1200&h=600&fit=crop',
        description: 'Sân bóng Thành Phát là một trong những cụm sân bóng cỏ nhân tạo chất lượng hàng đầu tại Hà Nội. Với hệ thống 8 sân 7 người có thể ghép thành sân 11, mặt cỏ luôn được bảo trì định kỳ, hệ thống chiếu sáng hiện đại mang đến trải nghiệm tốt nhất cho người chơi.',
        sportType: 'FOOTBALL',
        isPartner: true,
        amenities: [
          { id: 1, name: 'WiFi miễn phí' },
          { id: 2, name: 'Bãi đỗ xe ô tô' },
          { id: 3, name: 'Canteen & Đồ uống' },
          { id: 4, name: 'Phòng thay đồ' },
          { id: 5, name: 'Thuê giày & bóng' }
        ],
        courts: [
          { id: 'c1', name: 'Sân 7 - Sân số 1', basePrice: 450000 },
          { id: 'c2', name: 'Sân 7 - Sân số 2', basePrice: 450000 },
          { id: 'c3', name: 'Sân 11 - Sân chính', basePrice: 1200000 }
        ],
        openingHours: [
          { day: 'Thứ Hai', open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Ba', open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Tư', open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Năm', open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Sáu', open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Bảy', open: '05:00', close: '24:00', isClosed: false },
          { day: 'Chủ Nhật', open: '05:00', close: '24:00', isClosed: false }
        ]
      },
      timeSlots: [
        { id: 1, time: '05:00 - 06:00', price: 300000, status: 'AVAILABLE' },
        { id: 2, time: '06:00 - 07:00', price: 350000, status: 'AVAILABLE' },
        { id: 3, time: '07:00 - 08:30', price: 450000, status: 'BOOKED' },
        { id: 4, time: '16:00 - 17:30', price: 600000, status: 'AVAILABLE' },
        { id: 5, time: '17:30 - 19:00', price: 800000, status: 'AVAILABLE' },
        { id: 6, time: '19:00 - 20:30', price: 800000, status: 'AVAILABLE' },
        { id: 7, time: '20:30 - 22:00', price: 500000, status: 'AVAILABLE' }
      ]
    };
  },
  computed: {
    nextSevenDays() {
      const dates = [];
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);
        dates.push({
          full: d.toISOString().split('T')[0],
          dayName: i === 0 ? 'Hôm nay' : days[d.getDay()],
          dayNumber: d.getDate(),
          month: d.getMonth() + 1
        });
      }
      return dates;
    },
    selectedDateFormatted() {
      if (!this.selectedDate) return '';
      const [year, month, day] = this.selectedDate.split('-');
      return `${day}/${month}/${year}`;
    },
    selectedCourtName() {
      const court = this.venue.courts.find(c => c.id === this.selectedCourtId);
      return court ? court.name : '';
    },
    filteredSlots() {
      // In real app, fetch based on court and date
      return this.timeSlots;
    },
    totalPrice() {
      return this.selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    }
  },
  created() {
    this.selectedDate = this.nextSevenDays[0].full;
    this.selectedCourtId = this.venue.courts[0].id;
  },
  methods: {
    formatPrice(val) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
    },
    isSelected(slot) {
      return this.selectedSlots.some(s => s.id === slot.id);
    },
    toggleSlot(slot) {
      if (slot.status === 'BOOKED' || slot.status === 'LOCKED') return;
      
      const index = this.selectedSlots.findIndex(s => s.id === slot.id);
      if (index > -1) {
        this.selectedSlots.splice(index, 1);
      } else {
        this.selectedSlots.push(slot);
      }
    },
    handleBooking() {
      alert(`Đã đặt sân thành công! \nĐịa điểm: ${this.venue.name} \nTổng tiền: ${this.formatPrice(this.totalPrice)}`);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;800;900&display=swap');

.venue-detail-page {
  font-family: 'Barlow', sans-serif;
  background: #f8fafc;
  min-height: 100vh;
}

/* ─── HERO ─── */
.venue-hero {
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  color: white;
  padding-bottom: 50px;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}

.breadcrumb a { color: rgba(255,255,255,0.8); text-decoration: none; }
.breadcrumb .sep { color: rgba(255,255,255,0.4); }
.breadcrumb .current { color: #4ade80; font-weight: 600; }

.venue-badges {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.badge-partner {
  background: #16a34a;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 4px;
}

.badge-type {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
}

.venue-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 42px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.venue-address {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  opacity: 0.9;
}

/* ─── TABS ─── */
.main-layout { margin-top: -30px; position: relative; z-index: 5; padding-bottom: 80px; }

.venue-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
}

.tab-btn {
  background: white;
  border: none;
  padding: 12px 24px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #64748b;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.tab-btn--active {
  background: #1e293b;
  color: white;
}

/* ─── DATE SELECTOR ─── */
.date-selector {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.date-item {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.date-item:hover { background: #e2e8f0; }

.date-item--active {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22,163,74,0.2);
}

.day-name { font-size: 11px; font-weight: 700; text-transform: uppercase; opacity: 0.8; }
.day-number { font-size: 22px; font-weight: 900; font-family: 'Barlow Condensed', sans-serif; }
.month-name { font-size: 12px; font-weight: 600; }

/* ─── COURT CHIPS ─── */
.court-chips { display: flex; flex-wrap: wrap; gap: 10px; }

.court-chip {
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 50px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.court-chip--active {
  border-color: #16a34a;
  background: #f0fdf4;
  color: #15803d;
}

.court-price { font-size: 11px; opacity: 0.7; }

/* ─── TIME SLOTS ─── */
.slots-header { display: flex; justify-content: flex-end; margin-bottom: 20px; }
.legend { display: flex; gap: 15px; font-size: 12px; color: #64748b; }
.legend-item { display: flex; align-items: center; gap: 5px; }
.box { width: 14px; height: 14px; border-radius: 3px; }
.box.available { background: #f1f5f9; border: 1px solid #e2e8f0; }
.box.selected { background: #16a34a; }
.box.booked { background: #fee2e2; border: 1px solid #fecaca; }

.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

.time-slot {
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.time-slot:hover:not(.time-slot--booked) { border-color: #16a34a; transform: scale(1.02); }

.time-slot--booked {
  background: #f8fafc;
  border-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.6;
}

.time-slot--booked .slot-time { text-decoration: line-through; color: #94a3b8; }
.time-slot--booked .slot-price { display: none; }

.time-slot--selected {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
}

.slot-time { display: block; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.slot-price { display: block; font-size: 12px; font-weight: 600; opacity: 0.8; }

/* ─── SUMMARY CARD ─── */
.slot-item-summary {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
}

.slot-dots { flex: 1; border-bottom: 1px dotted #cbd5e1; margin: 0 10px; }
.slot-price { font-weight: 700; color: #1e293b; }

.remove-slot {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  margin-left: 10px;
  cursor: pointer;
}

.cta-submit { border-radius: 12px; letter-spacing: 0.5px; box-shadow: 0 10px 20px rgba(22,163,74,0.15); }

/* ─── INFO TAB ─── */
.amenities-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.amenity-item { display: flex; align-items: center; gap: 10px; }
.amenity-icon { color: #16a34a; background: #f0fdf4; padding: 6px; border-radius: 50%; display: flex; }
.amenity-name { font-size: 14px; color: #475569; }

.opening-hours li { padding: 8px 12px; border-radius: 6px; }
.opening-hours li:nth-child(even) { background: #f8fafc; }

@media (max-width: 991px) {
  .venue-name { font-size: 32px; }
  .booking-summary { margin-top: 30px; position: static !important; }
}
</style>
