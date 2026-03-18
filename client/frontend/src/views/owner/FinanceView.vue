<template>
  <div class="finance-view">
    <!-- Header: Page Title & Actions -->
    <div class="view-header">
      <div class="header-info">
        <h1 class="view-title">Trung tâm Tài chính</h1>
        <p class="view-subtitle">Báo cáo doanh thu, lợi nhuận và quản lý dòng tiền của bạn.</p>
      </div>
      <div class="header-actions">
        <button class="export-btn">
          <span class="material-icons">download</span>
          <span>Xuất báo cáo (Excel)</span>
        </button>
      </div>
    </div>

    <!-- Stats Row: Quick Numbers -->
    <div class="stats-row">
      <div v-for="(stat, i) in summaryStats" :key="stat.label" class="fin-stat-card" :style="`--delay: ${i * 80}ms`">
        <div class="f-stat-icon" :class="stat.color">
          <span class="material-icons">{{ stat.icon }}</span>
        </div>
        <div class="f-stat-body">
          <p class="f-stat-label">{{ stat.label }}</p>
          <div class="f-stat-val-group">
            <h3 class="f-stat-value">{{ stat.value }}</h3>
            <span class="f-stat-trend" :class="stat.trend">
              {{ stat.change }}% {{ stat.trend === 'up' ? '↑' : '↓' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Grid Content -->
    <div class="finance-grid">
      <!-- Left Column: Chart & Transactions -->
      <div class="grid-left">
        <!-- Revenue Chart Simulation -->
        <div class="card chart-card">
          <div class="card-header">
            <h3 class="card-title">Doanh thu 7 ngày gần nhất</h3>
            <div class="chart-legend">
              <span class="legend-item"><span class="dot online"></span>Trực tuyến</span>
              <span class="legend-item"><span class="dot cash"></span>Tại sân</span>
            </div>
          </div>
          <div class="simulated-chart">
            <div v-for="bar in chartData" :key="bar.day" class="chart-column">
              <div class="bar-group">
                <div class="bar online" :style="`height: ${bar.online}%`" :title="`Online: ${bar.onlineVal}đ`"></div>
                <div class="bar cash" :style="`height: ${bar.cash}%`" :title="`Tại sân: ${bar.cashVal}đ`"></div>
              </div>
              <span class="day-label">{{ bar.day }}</span>
            </div>
          </div>
        </div>

        <!-- Latest Transactions Table -->
        <div class="card table-card">
          <div class="card-header">
            <h3 class="card-title">Lịch sử giao dịch mới nhất</h3>
            <router-link to="#" class="view-all">Xem tất cả</router-link>
          </div>
          <div class="table-wrap">
            <table class="fin-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Mã đơn</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in recentTransactions" :key="tx.id">
                  <td class="tx-time">
                    <p class="t-main">{{ tx.date }}</p>
                    <p class="t-sub">{{ tx.time }}</p>
                  </td>
                  <td><span class="tx-id">#{{ tx.orderId }}</span></td>
                  <td>
                    <div class="tx-type">
                      <span class="material-icons type-icon" :class="tx.type">
                        {{ tx.type === 'deposit' ? 'add_circle' : 'account_balance_wallet' }}
                      </span>
                      <span>{{ tx.typeLabel }}</span>
                    </div>
                  </td>
                  <td class="tx-amount" :class="tx.type">
                    {{ tx.type === 'deposit' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                  </td>
                  <td>
                    <span class="status-pill" :class="tx.status">
                      <span class="status-dot"></span>
                      {{ tx.statusLabel }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Wallet & Breakdown -->
      <div class="grid-right">
        <!-- Payout Wallet Card -->
        <div class="wallet-card">
          <div class="wallet-bg-elements">
            <div class="circle c-1"></div>
            <div class="circle c-2"></div>
          </div>
          <div class="wallet-content">
            <div class="wallet-header">
              <span class="material-icons">account_balance_wallet</span>
              <p>Số dư khả dụng</p>
            </div>
            <h2 class="wallet-balance">{{ formatCurrency(12450000) }}</h2>
            <div class="wallet-details">
              <div class="detail-item">
                <p>Khấu trừ hoa hồng (10%)</p>
                <span>-{{ formatCurrency(1245000) }}</span>
              </div>
              <div class="detail-item total">
                <p>Thực nhận</p>
                <span>{{ formatCurrency(11205000) }}</span>
              </div>
            </div>
            <button class="payout-btn">
              <span>Yêu cầu rút tiền</span>
              <span class="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Revenue Breakdown by Club -->
        <div class="card breakdown-card">
          <h3 class="card-title">Doanh thu theo cơ sở</h3>
          <div class="breakdown-list">
            <div v-for="item in clubBreakdown" :key="item.name" class="breakdown-item">
              <div class="b-info">
                <span class="b-name">{{ item.name }}</span>
                <span class="b-percent">{{ item.percent }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="`width: ${item.percent}%; background: ${item.color}`"></div>
              </div>
              <div class="b-val">{{ formatCurrency(item.value) }}</div>
            </div>
          </div>
        </div>

        <!-- Top Selling Courts -->
        <div class="card ranking-card">
          <h3 class="card-title">Sân mang lại doanh thu cao</h3>
          <div class="ranking-list">
            <div v-for="(court, idx) in topCourts" :key="court.name" class="ranking-item">
              <div class="r-idx">0{{ idx + 1 }}</div>
              <div class="r-body">
                <p class="r-name">{{ court.name }}</p>
                <p class="r-sub">{{ court.bookings }} lượt đặt</p>
              </div>
              <div class="r-val">{{ formatCurrency(court.revenue) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OwnerFinanceView',
  data() {
    return {
      summaryStats: [
        { label: 'Doanh thu tháng này', value: '45.280.000đ', icon: 'payments', color: 'green', trend: 'up', change: 12.5 },
        { label: 'Số dư ví hiện tại', value: '11.205.000đ', icon: 'account_balance_wallet', color: 'blue', trend: 'up', change: 5.2 },
        { label: 'Trung bình/Ngày', value: '1.510.000đ', icon: 'trending_up', color: 'teal', trend: 'down', change: 2.1 },
        { label: 'Cần đối soát', value: '8.400.000đ', icon: 'pending_actions', color: 'amber', trend: 'up', change: 10.0 }
      ],
      chartData: [
        { day: 'T2', online: 70, onlineVal: '1.2M', cash: 30, cashVal: '400K' },
        { day: 'T3', online: 45, onlineVal: '800K', cash: 40, cashVal: '600K' },
        { day: 'T4', online: 60, onlineVal: '1.1M', cash: 20, cashVal: '300K' },
        { day: 'T5', online: 80, onlineVal: '1.5M', cash: 35, cashVal: '500K' },
        { day: 'T6', online: 95, onlineVal: '1.8M', cash: 45, cashVal: '750K' },
        { day: 'T7', online: 100, onlineVal: '2.5M', cash: 60, cashVal: '1.2M' },
        { day: 'CN', online: 90, onlineVal: '2.2M', cash: 55, cashVal: '1.1M' }
      ],
      recentTransactions: [
        { id: 1, orderId: 'BK1029', date: 'Hôm nay', time: '14:20', type: 'deposit', typeLabel: 'Thanh toán sân', amount: 350000, status: 'success', statusLabel: 'Thành công' },
        { id: 2, orderId: 'BK1030', date: 'Hôm nay', time: '11:15', type: 'deposit', typeLabel: 'Thanh toán sân', amount: 450000, status: 'success', statusLabel: 'Thành công' },
        { id: 3, orderId: 'WD-004', date: 'Hôm qua', time: '18:30', type: 'payout', typeLabel: 'Rút tiền về NH', amount: 5000000, status: 'pending', statusLabel: 'Đang xử lý' },
        { id: 4, orderId: 'BK1025', date: '16/03', time: '20:00', type: 'deposit', typeLabel: 'Thanh toán sân', amount: 3000000, status: 'success', statusLabel: 'Thành công' },
        { id: 5, orderId: 'BK1024', date: '16/03', time: '18:00', type: 'deposit', typeLabel: 'Thanh toán sân', amount: 350000, status: 'failed', statusLabel: 'Thất bại' }
      ],
      clubBreakdown: [
        { name: 'Sân bóng Thành Phát', percent: 65, value: 29432000, color: '#10b981' },
        { name: 'Viettel Sports Center', percent: 35, value: 15848000, color: '#3b82f6' }
      ],
      topCourts: [
        { name: 'Sân A1 (Thành Phát)', bookings: 145, revenue: 12450000 },
        { name: 'Sân B1 (Viettel)', bookings: 98, revenue: 9850000 },
        { name: 'Sân C3 (Thành Phát)', bookings: 76, revenue: 6200000 }
      ]
    }
  },
  methods: {
    formatCurrency(val) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

.finance-view {
  font-family: 'DM Sans', sans-serif;
  color: #0f1623;
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  border: 1px solid #eaecf2;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover { background-color: #f8fafc; border-color: #cbd5e1; }

/* ── Stats Row ─────────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.fin-stat-card {
  background: white;
  border: 1px solid #eaecf2;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 16px rgba(15,22,35,0.04);
}

.f-stat-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.f-stat-icon.green  { background: #ecfdf5; color: #059669; }
.f-stat-icon.blue   { background: #eff6ff; color: #2563eb; }
.f-stat-icon.teal   { background: #f0fdfa; color: #0d9488; }
.f-stat-icon.amber  { background: #fffbeb; color: #d97706; }

.f-stat-label { font-size: 13px; color: #64748b; font-weight: 500; margin: 0 0 4px 0; }
.f-stat-val-group { display: flex; align-items: baseline; gap: 8px; }
.f-stat-value { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; margin: 0; }
.f-stat-trend { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
.f-stat-trend.up { color: #059669; background: #d1fae5; }
.f-stat-trend.down { color: #ef4444; background: #fee2e2; }

/* ── Main Grid ─────────────────────────────────────────────── */
.finance-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 24px;
  border: 1px solid #eaecf2;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(15,22,35,0.04);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #1a293b;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.view-all { font-size: 13px; font-weight: 700; color: #16a34a; text-decoration: none; }

/* ── Simulated Chart ────────────────────────────────────────── */
.simulated-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 240px;
  padding-top: 20px;
  border-bottom: 2px solid #f1f5f9;
}

.chart-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.bar-group {
  width: 32px;
  height: 180px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.bar {
  flex: 1;
  border-radius: 6px 6px 2px 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.bar.online { background: linear-gradient(to top, #16a34a, #34d399); }
.bar.cash { background: linear-gradient(to top, #3b82f6, #60a5fa); }

.bar:hover { transform: scaleY(1.05); filter: brightness(1.1); }

.day-label { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #94a3b8; }

.chart-legend { display: flex; gap: 20px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #64748b; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.online { background: #16a34a; }
.dot.cash { background: #3b82f6; }

/* ── Transaction Table ─────────────────────────────────────── */
.table-wrap { overflow-x: auto; }
.fin-table { width: 100%; border-collapse: collapse; }
.fin-table th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; color: #94a3b8; border-bottom: 2px solid #f8fafc; }
.fin-table td { padding: 16px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.t-main { font-weight: 700; font-size: 14px; margin: 0; }
.t-sub { font-size: 11px; color: #94a3b8; margin: 0; }
.tx-id { font-family: 'Barlow Condensed', sans-serif; color: #64748b; font-weight: 700; }

.tx-type { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
.type-icon { font-size: 18px; }
.type-icon.deposit { color: #10b981; }
.type-icon.payout { color: #3b82f6; }

.tx-amount { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 16px; }
.tx-amount.deposit { color: #10b981; }
.tx-amount.payout { color: #ef4444; }

.status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-pill.success { background: #ecfdf5; color: #059669; }
.status-pill.pending { background: #fff7ed; color: #ea580c; }
.status-pill.failed { background: #fef2f2; color: #dc2626; }

/* ── Right Column: Wallet ──────────────────────────────────── */
.wallet-card {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-radius: 28px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  color: white;
  margin-bottom: 24px;
}

.wallet-bg-elements .circle { position: absolute; border-radius: 50%; background: white; opacity: 0.05; }
.c-1 { width: 140px; height: 140px; top: -40px; right: -40px; }
.c-2 { width: 80px; height: 80px; bottom: -20px; left: -20px; }

.wallet-header { display: flex; align-items: center; gap: 10px; opacity: 0.7; margin-bottom: 8px; }
.wallet-header p { font-size: 13px; font-weight: 600; margin: 0; }
.wallet-balance { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 800; margin: 0 0 24px 0; }

.wallet-details { background: rgba(255,255,255,0.06); padding: 18px; border-radius: 16px; margin-bottom: 24px; }
.detail-item { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: rgba(255,255,255,0.6); }
.detail-item.total { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); color: white; font-weight: 800; font-size: 16px; font-family: 'Barlow Condensed', sans-serif; }

.payout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: white;
  color: #0f172a;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s;
}

.payout-btn:hover { transform: scale(1.02); }

/* ── Breakdown List ────────────────────────────────────────── */
.breakdown-list { display: flex; flex-direction: column; gap: 20px; }
.breakdown-item { display: flex; flex-direction: column; gap: 8px; }
.b-info { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; }
.b-name { color: #1e293b; }
.b-percent { color: #64748b; }
.progress-bar { height: 8px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 100px; }
.b-val { text-align: right; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 16px; color: #1e293b; margin-top: 4px; }

/* ── Ranking List ─────────────────────────────────────────── */
.ranking-list { display: flex; flex-direction: column; gap: 16px; }
.ranking-item { display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 14px; transition: background 0.2s; }
.ranking-item:hover { background: #f8fafc; }
.r-idx { width: 32px; height: 32px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 14px; color: #94a3b8; }
.r-body { flex: 1; }
.r-name { font-weight: 700; font-size: 14px; margin: 0; color: #1e293b; }
.r-sub { font-size: 11px; color: #94a3b8; margin: 2px 0 0 0; }
.r-val { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; color: #059669; }

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1280px) {
  .finance-grid { grid-template-columns: 1fr; }
}

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 640px) {
  .stats-row { grid-template-columns: 1fr; }
  .view-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .wallet-card { padding: 20px; }
}
</style>
