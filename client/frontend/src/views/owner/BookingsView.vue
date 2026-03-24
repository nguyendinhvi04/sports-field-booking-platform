<template>
  <div class="bookings-view">
    <!-- Header Section -->
    <div class="view-header">
      <div class="header-info">
        <h1 class="view-title">Quản lý Đơn đặt sân</h1>
        <p class="view-subtitle">Theo dõi lịch trình sân bãi và quản lý yêu cầu từ khách hàng.</p>
      </div>

      <div class="view-switch">
        <button 
          class="switch-btn" 
          :class="{ active: currentView === 'calendar' }"
          @click="currentView = 'calendar'"
        >
          <span class="material-icons">calendar_view_day</span>
          <span>Lịch trực quan</span>
        </button>
        <button 
          class="switch-btn" 
          :class="{ active: currentView === 'list' }"
          @click="currentView = 'list'"
        >
          <span class="material-icons">list_alt</span>
          <span>Danh sách</span>
        </button>
      </div>
    </div>

    <!-- Toolbar: Date & Filters -->
    <div class="toolbar">
      <div class="date-navigator">
        <button class="nav-btn" @click="prevDay">
          <span class="material-icons">chevron_left</span>
        </button>
        <div class="current-date-box">
          <span class="material-icons">calendar_today</span>
          <span class="date-text">{{ formattedDate }}</span>
        </div>
        <button class="nav-btn" @click="nextDay">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>

      <div class="filter-group">
        <div class="filter-item">
          <label>Cơ sở:</label>
          <select v-model="selectedClubId">
            <option v-for="club in clubs" :key="club.id" :value="club.id">{{ club.name }}</option>
          </select>
        </div>
        <div class="filter-item" v-if="currentView === 'list'">
          <label>Trạng thái:</label>
          <select v-model="statusFilter">
            <option value="all">Tất cả</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>
        </div>
      </div>

      <div class="toolbar-actions">
        <button class="refresh-btn" @click="refreshData">
          <span class="material-icons">refresh</span>
        </button>
        <button class="add-booking-btn">
          <span class="material-icons">add_circle</span>
          <span>Đặt sân mới</span>
        </button>
      </div>
    </div>

    <!-- View Contents -->
    <div class="view-container">
      <!-- 1. CALENDAR VIEW -->
      <div v-if="currentView === 'calendar'" class="calendar-wrapper">
        <div class="calendar-grid">
          <!-- Time Column -->
          <div class="time-column">
            <div class="time-header">Thời gian</div>
            <div v-for="h in timeSlots" :key="h" class="time-slot">{{ h }}</div>
          </div>
          
          <!-- Court Columns -->
          <div class="court-columns-container">
            <div class="court-columns-scroll">
              <div v-for="court in currentClubCourts" :key="court.id" class="court-column">
                <div class="court-header">
                  <span class="court-name">{{ court.name }}</span>
                  <span class="court-type">{{ court.type }}</span>
                </div>
                
                <div class="slots-container">
                  <div v-for="h in timeSlots" :key="h" class="slot-cell">
                    <!-- Booking Entry if exists -->
                    <div 
                      v-if="getBooking(court.id, h)" 
                      class="booking-item" 
                      :class="getBooking(court.id, h).status"
                      :style="getBookingStyle(getBooking(court.id, h))"
                    >
                      <div class="booking-content">
                        <p class="b-name">{{ getBooking(court.id, h).customerName }}</p>
                        <p class="b-time">{{ getBooking(court.id, h).startTime }} - {{ getBooking(court.id, h).endTime }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. LIST VIEW -->
      <div v-else class="list-wrapper card fade-in">
        <div class="table-container">
          <table class="booking-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sân</th>
                <th>Thời gian</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in filteredBookings" :key="booking.id">
                <td><span class="order-id">#{{ booking.id }}</span></td>
                <td>
                  <div class="user-cell">
                    <img :src="`https://ui-avatars.com/api/?name=${booking.customerName}&background=0d9488&color=fff`" class="u-avatar" />
                    <div>
                      <p class="u-name">{{ booking.customerName }}</p>
                      <p class="u-phone">{{ booking.phone }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="court-tag">{{ booking.courtName }}</div>
                </td>
                <td>
                  <p class="t-main">{{ booking.startTime }} - {{ booking.endTime }}</p>
                  <p class="t-sub">{{ booking.date }}</p>
                </td>
                <td>
                  <p class="amount">{{ formatCurrency(booking.amount) }}</p>
                </td>
                <td>
                  <span :class="['status-pill', booking.status]">
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </td>
                <td class="action-cell">
                  <button class="btn-icon" title="Chi tiết"><span class="material-icons">visibility</span></button>
                  <button v-if="booking.status === 'PENDING'" class="btn-icon confirm"><span class="material-icons">check_circle</span></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OwnerBookingsView',
  data() {
    return {
      currentView: 'calendar', // 'calendar' or 'list'
      selectedClubId: 1,
      currentDate: new Date(),
      statusFilter: 'all',
      clubs: [
        { id: 1, name: 'Sân bóng Thành Phát' },
        { id: 2, name: 'Viettel Sports Center' }
      ],
      courts: [
        { id: 1, clubId: 1, name: 'Sân A1', type: 'Sân 5' },
        { id: 2, clubId: 1, name: 'Sân A2', type: 'Sân 5' },
        { id: 3, clubId: 1, name: 'Sân B1', type: 'Sân 7' },
        { id: 4, clubId: 1, name: 'Sân B2', type: 'Sân 7' },
        { id: 5, clubId: 1, name: 'Sân C1', type: 'Sân 11' },
      ],
      timeSlots: [
        '06:00', '07:30', '09:00', '10:30', '12:00', '13:30', 
        '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'
      ],
      bookings: [
        { 
          id: 'BK1029', 
          clubId: 1, 
          courtId: 1, 
          courtName: 'Sân A1',
          customerName: 'Trần Văn Mạnh', 
          phone: '0987 654 321',
          startTime: '18:00', 
          endTime: '19:30', 
          date: 'Hôm nay, 18/03',
          amount: 350000,
          status: 'CONFIRMED' 
        },
        { 
          id: 'BK1030', 
          clubId: 1, 
          courtId: 2, 
          courtName: 'Sân A2',
          customerName: 'Nguyễn Hồng Liên', 
          phone: '0912 333 888',
          startTime: '19:30', 
          endTime: '21:00', 
          date: 'Hôm nay, 18/03',
          amount: 350000,
          status: 'PENDING' 
        },
        { 
          id: 'BK1031', 
          clubId: 1, 
          courtId: 3, 
          courtName: 'Sân B1',
          customerName: 'Lê Tuấn Vũ', 
          phone: '0345 888 999',
          startTime: '18:00', 
          endTime: '19:30', 
          date: 'Hôm nay, 18/03',
          amount: 500000,
          status: 'COMPLETED' 
        }
      ]
    }
  },
  computed: {
    formattedDate() {
      return this.currentDate.toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },
    currentClubCourts() {
      return this.courts.filter(c => c.clubId === this.selectedClubId);
    },
    filteredBookings() {
      return this.bookings.filter(b => {
        const clubMatch = b.clubId === this.selectedClubId;
        const statusMatch = this.statusFilter === 'all' || b.status === this.statusFilter;
        return clubMatch && statusMatch;
      });
    }
  },
  methods: {
    getBooking(courtId, startTime) {
      return this.bookings.find(b => b.courtId === courtId && b.startTime === startTime);
    },
    getBookingStyle(booking) {
      // Logic for multi-slot bookings could go here
      return {};
    },
    getStatusLabel(status) {
      const labels = {
        PENDING: 'Đang chờ',
        CONFIRMED: 'Đã xác nhận',
        COMPLETED: 'Hoàn thành'
      };
      return labels[status] || status;
    },
    formatCurrency(val) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    },
    prevDay() {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() - 1);
      this.currentDate = d;
    },
    nextDay() {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() + 1);
      this.currentDate = d;
    },
    refreshData() {
      // Simulate API call
      console.log('Refreshing bookings...');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

.bookings-view {
  font-family: 'DM Sans', sans-serif;
  color: #0f1623;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Header ────────────────────────────────────────────────── */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 4px 0;
  text-transform: uppercase;
}

.view-subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

.view-switch {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.switch-btn.active {
  background: white;
  color: #16a34a;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* ── Toolbar ───────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #eaecf2;
  gap: 20px;
}

.date-navigator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-date-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.date-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.nav-btn {
  width: 40px; height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover { background: #f1f5f9; }

.filter-group {
  display: flex;
  gap: 20px;
  flex: 1;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}

.filter-item select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
}

.refresh-btn {
  width: 44px; height: 44px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
}

.add-booking-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #16a34a;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}

/* ── Calendar View ─────────────────────────────────────────── */
.calendar-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 20px;
  border: 1px solid #eaecf2;
  padding: 20px;
}

.calendar-grid {
  display: flex;
  min-width: 1000px;
}

.time-column {
  width: 100px;
  flex-shrink: 0;
  border-right: 1px solid #f1f5f9;
}

.time-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  border-bottom: 2px solid #f1f5f9;
}

.time-slot {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #475569;
  border-bottom: 1px solid #f8fafc;
}

.court-columns-container {
  flex: 1;
}

.court-columns-scroll {
  display: flex;
}

.court-column {
  flex: 1;
  min-width: 180px;
  border-right: 1px solid #f1f5f9;
}

.court-header {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid #f1f5f9;
  background: #fcfdfe;
}

.court-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #1e293b;
}

.court-type {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
}

.slots-container {
  position: relative;
}

.slot-cell {
  height: 80px;
  border-bottom: 1px solid #f8fafc;
  padding: 4px;
  background: #ffffff;
  transition: background 0.2s;
}

.slot-cell:hover { background: #fcfdfe; }

.booking-item {
  height: 100%;
  border-radius: 8px;
  padding: 8px;
  font-size: 11px;
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
  border-left: 4px solid transparent;
}

.booking-item:hover { transform: scale(0.98); }

.booking-item.CONFIRMED { background: #ecfdf5; color: #065f46; border-left-color: #10b981; }
.booking-item.PENDING { background: #fffbeb; color: #92400e; border-left-color: #f59e0b; }
.booking-item.COMPLETED { background: #eff6ff; color: #1e40af; border-left-color: #3b82f6; }

.b-name { font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.b-time { margin: 2px 0 0 0; opacity: 0.8; }

/* ── List View ─────────────────────────────────────────────── */
.list-wrapper {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #eaecf2;
}

.booking-table {
  width: 100%;
  border-collapse: collapse;
}

.booking-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 11px;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #f1f5f9;
}

.booking-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.order-id { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; color: #64748b; }

.user-cell { display: flex; align-items: center; gap: 12px; }
.u-avatar { width: 36px; height: 36px; border-radius: 50%; }
.u-name { font-weight: 700; font-size: 14px; margin: 0; }
.u-phone { font-size: 12px; color: #94a3b8; margin: 0; }

.court-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.t-main { font-weight: 700; font-size: 14px; margin: 0; }
.t-sub { font-size: 12px; color: #94a3b8; margin: 0; }

.amount { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 16px; color: #1e293b; }

.status-pill {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
}

.status-pill.CONFIRMED { background: #ecfdf5; color: #059669; }
.status-pill.PENDING { background: #fff7ed; color: #ea580c; }
.status-pill.COMPLETED { background: #eff6ff; color: #2563eb; }

.action-cell { display: flex; gap: 8px; justify-content: flex-end; }
.btn-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.btn-icon:hover { background: #f1f5f9; border-color: #cbd5e1; }
.btn-icon.confirm:hover { background: #16a34a; color: white; border-color: #16a34a; }

.fade-in { animation: fadeIn 0.4s ease-out; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 1024px) {
  .toolbar { flex-wrap: wrap; }
  .view-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>
