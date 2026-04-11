<template>
  <div class="page">
    <div class="page-header custom-header">
      <div class="header-left">
         <div class="page-title">Dashboard <span class="count">Tổng quan hệ thống</span></div>
         <div class="page-subtitle">Chào mừng trở lại, Super Admin — Cập nhật lần cuối: {{ currentTime }}</div>
      </div>
      
      <div class="header-actions">
         <div class="date-period-picker">
            <button 
              v-for="p in periods" 
              :key="p.id" 
              class="period-btn" 
              :class="{active: selectedPeriod === p.id}"
              @click="handlePeriodChange(p.id)"
            >
              {{ p.label }}
            </button>
            <div class="custom-range" v-if="selectedPeriod === 'custom'">
               <input type="date" v-model="customDates.start" @change="fetchDashboardData" />
               <span>→</span>
               <input type="date" v-model="customDates.end" @change="fetchDashboardData" />
            </div>
         </div>
      </div>
    </div>

    <div class="stat-grid">
      <DashboardStatCard 
        v-for="s in dashboardStats" 
        :key="s.label" 
        v-bind="s" 
      />
    </div>

    <div class="dashboard-main-grid">
      <div class="primary-charts">
        <MonthlyBookingsChart :months="months" :values="chartValues" />
        
        <div class="charts-sub-row">
          <CourtTypeDistribution :data="courtTypeData" />
          <PendingObjectsWidget :items="pendingItems" />
        </div>
      </div>
      
      <div class="side-panel">
        <div class="alert-bar warning">
          <AlertCircle :size="16" />
          <span><strong>{{ pendingCourtCount }} sân</strong> đang chờ duyệt</span>
          <router-link to="/admin/courts" class="btn-link">Duyệt ngay</router-link>
        </div>
        
        <div class="activity-card">
          <div class="card-title">Hoạt động gần đây</div>
          <div class="activity-list">
            <div v-for="a in recentActivities" :key="a.time" class="activity-item">
              <div class="activity-dot"></div>
              <div class="activity-content">
                <div class="activity-text">{{ a.text }}</div>
                <div class="activity-time">{{ a.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import { 
  Users, MapPin, Calendar, CircleDollarSign, AlertCircle, ShieldCheck
} from 'lucide-vue-next';

// Dashboard Components
import DashboardStatCard from './components/DashboardStatCard.vue';
import MonthlyBookingsChart from './components/MonthlyBookingsChart.vue';
import CourtTypeDistribution from './components/CourtTypeDistribution.vue';
import PendingObjectsWidget from './components/PendingObjectsWidget.vue';
import { adminService } from '@/services/admin.service';

export default {
  name: 'DashboardAdmin',
  components: {
    AlertCircle,
    DashboardStatCard,
    MonthlyBookingsChart,
    CourtTypeDistribution,
    PendingObjectsWidget
  },
  setup() {
    const currentTime = ref('');
    const months = ref(['T10', 'T11', 'T12', 'T1', 'T2', 'T3']);
    const chartValues = ref([55, 70, 62, 80, 74, 90]);
    const loading = ref(false);

    const periods = [
      { id: 'today', label: 'Hôm nay' },
      { id: 'week', label: 'Tuần này' },
      { id: 'month', label: 'Tháng này' },
      { id: 'custom', label: 'Tùy chọn' }
    ];
    const selectedPeriod = ref('today');
    const customDates = reactive({
      start: '',
      end: ''
    });

    const dashboardStats = ref([
      { label: 'Người dùng', iconComponent: Users, value: '...', change: '0%', trend: 'up', bg: 'var(--accent-soft)', color: 'var(--accent)' },
      { label: 'Cơ sở hoạt động', iconComponent: MapPin, value: '...', change: '0%', trend: 'up', bg: 'var(--green-soft)', color: 'var(--green)' },
      { label: 'Lượt đặt (Lọc)', iconComponent: Calendar, value: '0', change: '0%', trend: 'up', bg: 'var(--orange-soft)', color: 'var(--orange)' },
      { label: 'Doanh thu (Lọc)', iconComponent: CircleDollarSign, value: '₫0', change: '0%', trend: 'up', bg: 'var(--purple-soft)', color: 'var(--purple)' }
    ]);

    const courtTypeData = ref([
      { label: 'Bóng đá', value: 0, color: '#4f6ef7' },
      { label: 'Cầu lông', value: 0, color: '#22c55e' },
      { label: 'Tennis', value: 0, color: '#f97316' }
    ]);

    const pendingItems = ref([]);
    const pendingCourtCount = ref(0);

    const handlePeriodChange = (pid) => {
      selectedPeriod.value = pid;
      if (pid !== 'custom') {
        fetchDashboardData();
      }
    };

    const fetchDashboardData = async () => {
      loading.value = true;
      try {
        let start = undefined;
        let end = undefined;

        if (selectedPeriod.value === 'today') {
           const d = new Date();
           start = d.toISOString().split('T')[0];
        } else if (selectedPeriod.value === 'week') {
           const d = new Date();
           d.setDate(d.getDate() - 7);
           start = d.toISOString().split('T')[0];
        } else if (selectedPeriod.value === 'month') {
           const d = new Date();
           d.setMonth(d.getMonth() - 1);
           start = d.toISOString().split('T')[0];
        } else if (selectedPeriod.value === 'custom') {
           start = customDates.start;
           end = customDates.end;
        }

        // 1. Lấy dữ liệu tổng quan (Counts) với filter
        const summaryRes = await adminService.getSummary(start, end);
        const summary = summaryRes.data.data;

        // Cập nhật các thẻ thống kê chính
        dashboardStats.value[0].value = (summary.totalUsers || 0).toString();
        dashboardStats.value[1].value = (summary.activeClubs || 0).toString();
        dashboardStats.value[2].value = (summary.todayBookings || 0).toString(); 
        dashboardStats.value[3].value = `₫${(summary.totalRevenue || 0).toLocaleString('vi-VN')}`;

        // Cập nhật dữ liệu biểu đồ (Charts)
        if (summary.monthlyStats && summary.monthlyStats.length > 0) {
           months.value = summary.monthlyStats.map(s => `T${parseInt(s.month.split('/')[0])}`);
           chartValues.value = summary.monthlyStats.map(s => s.count);
        }

        // 2. Lấy dữ liệu chi tiết cho Widgets
        const [clubsRes, kycRes] = await Promise.all([
          adminService.getAllClubs(),
          adminService.getAllKyc()
        ]);
        
        const clubs = clubsRes.data.data || [];
        const kyc = kycRes.data.data || [];

        const pendingClubs = clubs.filter(c => c.approvalStatus === 'PENDING');
        const pendingKyc = kyc.filter(k => k.kycStatus === 'PENDING');
        pendingCourtCount.value = pendingClubs.length;

        // Cập nhật danh sách "Pending Items" Widget
        const items = [];
        pendingClubs.slice(0, 2).forEach(c => {
          items.push({ id: `c-${c.id}`, type: 'court', icon: MapPin, name: c.name, subtitle: 'Cơ sở mới', time: 'Đang chờ' });
        });
        pendingKyc.slice(0, 2).forEach(k => {
          items.push({ id: `k-${k.id}`, type: 'kyc', icon: ShieldCheck, name: k.user?.fullName || 'Chủ sân', subtitle: 'Xác minh KYC', time: 'Đang chờ' });
        });
        pendingItems.value = items;

        // Phân bổ loại hình thể thao (Sport Distribution)
        const counts = clubs.reduce((acc, club) => {
           club.courts?.forEach(court => {
              const type = court.sportType === 'FOOTBALL' ? 'Bóng đá' : 
                          court.sportType === 'BADMINTON' ? 'Cầu lông' : 
                          court.sportType === 'TENNIS' ? 'Tennis' : 
                          court.sportType === 'PICKLEBALL' ? 'Pickleball' : 
                          court.sportType === 'BASKETBALL' ? 'Bóng rổ' : 'Khác';
              acc[type] = (acc[type] || 0) + 1;
           });
           return acc;
        }, {});
        
        courtTypeData.value = [
          { label: 'Bóng đá', value: counts['Bóng đá'] || 0, color: '#4f6ef7' },
          { label: 'Cầu lông', value: counts['Cầu lông'] || 0, color: '#22c55e' },
          { label: 'Tennis', value: counts['Tennis'] || 0, color: '#f97316' },
          { label: 'Pickleball', value: counts['Pickleball'] || 0, color: '#ec4899' },
          { label: 'Bóng rổ', value: counts['Bóng rổ'] || 0, color: '#eab308' }
        ];

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        loading.value = false;
      }
    };

    const recentActivities = [
      { text: 'Hệ thống đã sẵn sàng cho ngày mới.', time: 'vừa xong' },
      { text: 'Admin đã đăng nhập vào hệ thống.', time: 'vừa xong' }
    ];

    const updateTime = () => {
      const now = new Date();
      currentTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}, ${now.toLocaleDateString()}`;
    };

    onMounted(() => {
      updateTime();
      fetchDashboardData();
    });

    return {
      dashboardStats,
      currentTime,
      months,
      chartValues,
      courtTypeData,
      pendingItems,
      recentActivities,
      pendingCourtCount,
      loading,
      periods,
      selectedPeriod,
      customDates,
      handlePeriodChange,
      fetchDashboardData
    };
  }
}
</script>

<style scoped>
.custom-header { display: flex; justify-content: space-between; align-items: flex-start; }
.date-period-picker { display: flex; align-items: center; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 4px; gap: 4px; }
.period-btn { 
  padding: 8px 14px; border-radius: 9px; border: none; background: transparent; 
  color: var(--text-secondary); font-size: 13px; font-weight: 700; cursor: pointer; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.period-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }
.period-btn.active { background: var(--accent); color: white; box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3); }

.custom-range { display: flex; align-items: center; gap: 8px; padding: 0 10px; margin-left: 6px; border-left: 1px solid var(--border); }
.custom-range input { background: transparent; border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 12px; color: var(--text-primary); cursor: pointer; }
.custom-range input:focus { outline: none; border-color: var(--accent); }
.custom-range span { color: var(--text-muted); font-size: 14px; }

.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }

.dashboard-main-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }

.primary-charts { display: flex; flex-direction: column; gap: 24px; }
.charts-sub-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

.side-panel { display: flex; flex-direction: column; gap: 24px; }

.alert-bar { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  padding: 20px; 
  border-radius: var(--radius-lg); 
  font-size: 13px; 
  border: 1px solid; 
  background: var(--orange-soft); 
  border-color: rgba(249,115,22,0.2); 
  color: var(--orange); 
}
.alert-bar .btn-link { 
  display: inline-block; 
  background: var(--orange); 
  color: #fff; 
  padding: 8px 16px; 
  border-radius: 6px; 
  text-decoration: none; 
  font-weight: 600; 
  text-align: center; 
}

.activity-card { 
  background: var(--bg-secondary); 
  border: 1px solid var(--border); 
  border-radius: var(--radius-lg); 
  padding: 20px; 
}
.card-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary); }

.activity-list { display: flex; flex-direction: column; gap: 16px; position: relative; }
.activity-item { display: flex; gap: 12px; position: relative; }
.activity-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); margin-top: 5px; flex-shrink: 0; }
.activity-content { flex: 1; }
.activity-text { font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
.activity-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

@media (max-width: 1200px) {
  .dashboard-main-grid { grid-template-columns: 1fr; }
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

