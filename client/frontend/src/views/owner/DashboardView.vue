<template>
  <div class="dashboard-container">
    <!-- Header Summary Stats -->
    <div class="stats-grid">
      <StatCard 
        v-for="(stat, i) in summaryStats" 
        :key="stat.label" 
        :stat="stat" 
        :delay="i * 80" 
      />
    </div>

    <div class="content-row">
      <!-- Recent Bookings Table -->
      <RecentBookings :bookings="recentBookings" />

      <!-- Side Panel -->
      <div class="side-content">
        <!-- Quick Actions -->
        <QuickActions 
          @add-offline-booking="handleOfflineBooking"
          @lock-court="handleLockCourt"
          @view-reports="handleViewReports"
        />

        <!-- Court Status -->
        <CourtStatus :courts="courts" />
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '../../components/owner/dashboard/StatCard.vue';
import RecentBookings from '../../components/owner/dashboard/RecentBookings.vue';
import QuickActions from '../../components/owner/dashboard/QuickActions.vue';
import CourtStatus from '../../components/owner/dashboard/CourtStatus.vue';

export default {
  name: 'OwnerDashboardView',
  components: {
    StatCard,
    RecentBookings,
    QuickActions,
    CourtStatus
  },
  data() {
    return {
      summaryStats: [
        { label: 'Doanh thu tháng này', value: '45.280.000đ', icon: 'payments',       color: 'green',  trend: 'up',   change: 12.5, fill: 72 },
        { label: 'Lượt đặt sân',        value: '382',          icon: 'calendar_month', color: 'blue', trend: 'up',   change: 8.2,  fill: 60 },
        { label: 'Khách hàng mới',      value: '124',          icon: 'group',          color: 'teal', trend: 'up',   change: 15.0, fill: 84 },
        { label: 'Đánh giá trung bình', value: '4.8 / 5',      icon: 'star',           color: 'amber',trend: 'up',   change: 2.1,  fill: 96 },
      ],
      recentBookings: [
        { id: 1, name: 'Nguyễn Văn A', phone: '0987 xxx 321', court: 'Sân 5 – A', time: '18:00 – 19:30', date: 'Hôm nay, 18/03', amount: '350.000đ', method: 'Chuyển khoản', status: 'PENDING',   statusText: 'Chờ xác nhận', statusClass: 'warning' },
        { id: 2, name: 'Trần Thị B',   phone: '0912 xxx 888', court: 'Sân 7 – C', time: '20:00 – 21:00', date: 'Hôm nay, 18/03', amount: '450.000đ', method: 'Momo',         status: 'CONFIRMED', statusText: 'Đã xác nhận',  statusClass: 'success' },
        { id: 3, name: 'Lê Văn C',     phone: '0345 xxx 999', court: 'Sân 5 – B', time: '17:00 – 18:30', date: 'Hôm nay, 18/03', amount: '300.000đ', method: 'Tiền mặt',     status: 'COMPLETED', statusText: 'Hoàn thành',   statusClass: 'info'    },
      ],
      courts: [
        { id: 1, name: 'Sân 5 – A', status: 'occupied',  statusText: 'Đang đá',   session: 'Còn 45 phút' },
        { id: 2, name: 'Sân 5 – B', status: 'occupied',  statusText: 'Đang đá',   session: 'Còn 15 phút' },
        { id: 3, name: 'Sân 7 – C', status: 'available', statusText: 'Trống sân', session: null },
        { id: 4, name: 'Sân 5 – D', status: 'locked',    statusText: 'Bảo trì',   session: 'Đến 17:00' },
      ]
    }
  },
  methods: {
    handleOfflineBooking() {
      console.log('Navigating to offline booking...');
    },
    handleLockCourt() {
      console.log('Opening lock court modal...');
    },
    handleViewReports() {
      console.log('Navigating to reports...');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');

.dashboard-container {
  font-family: 'Barlow Condensed', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ── Stats Grid ────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* ── Layout ────────────────────────────────────────────────── */
.content-row {
  display: flex; gap: 20px; align-items: flex-start;
}
.side-content  { flex: 1; display: flex; flex-direction: column; gap: 20px; }

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1280px) {
  .stats-grid   { grid-template-columns: repeat(2, 1fr); }
  .content-row  { flex-direction: column; }
  .side-content { flex-direction: row; }
  .side-content > * { flex: 1; }
}

@media (max-width: 768px) {
  .stats-grid   { grid-template-columns: 1fr 1fr; }
  .side-content { flex-direction: column; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>