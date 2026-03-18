<template>
  <div class="customers-view">
    <!-- Header Section -->
    <div class="view-header">
      <div class="header-info">
        <h1 class="view-title">Hệ thống Khách hàng</h1>
        <p class="view-subtitle">Quản lý cơ sở dữ liệu khách hàng, phân hạng và theo dõi lòng trung thành.</p>
      </div>
      <div class="header-stats">
        <div class="h-stat-item">
          <span class="h-stat-label">Tổng khách hàng</span>
          <span class="h-stat-val">2,840</span>
        </div>
        <div class="h-stat-divider"></div>
        <div class="h-stat-item">
          <span class="h-stat-label">Khách mới (Tháng)</span>
          <span class="h-stat-val text-green">+142</span>
        </div>
      </div>
    </div>

    <!-- Toolbar: Search & Tier Filters -->
    <div class="toolbar card">
      <div class="search-box">
        <span class="material-icons">search</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Tìm khách hàng theo tên, số điện thoại hoặc email..." 
        />
      </div>
      <div class="filter-group">
        <div class="filter-item">
          <label>Phân hạng:</label>
          <div class="tier-chips">
            <button 
              v-for="tier in tiers" 
              :key="tier.id" 
              class="tier-chip"
              :class="[{ active: selectedTier === tier.id }, tier.id]"
              @click="selectedTier = tier.id"
            >
              {{ tier.label }}
            </button>
          </div>
        </div>
        <div class="filter-item">
          <label>Sắp xếp:</label>
          <select v-model="sortBy">
            <option value="recent">Mới nhất</option>
            <option value="spending">Chi tiêu cao nhất</option>
            <option value="bookings">Lượt đặt nhiều nhất</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Customers Main Layout -->
    <div class="customers-layout">
      <!-- Left: Customers List -->
      <div class="customers-list-side">
        <div class="card list-card">
          <div class="table-wrap">
            <table class="customer-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Hạng</th>
                  <th>Lượt đặt</th>
                  <th>Chi tiêu</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="customer in filteredCustomers" 
                  :key="customer.id"
                  :class="{ selected: selectedCustomerId === customer.id }"
                  @click="selectedCustomerId = customer.id"
                >
                  <td>
                    <div class="user-info-cell">
                      <div class="avatar-wrap">
                        <img :src="customer.avatar" :alt="customer.name" />
                        <span class="online-indicator" v-if="customer.isOnline"></span>
                      </div>
                      <div class="user-meta">
                        <p class="u-name">{{ customer.name }}</p>
                        <p class="u-phone">{{ customer.phone }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="tier-badge" :class="customer.tier">
                      {{ getTierLabel(customer.tier) }}
                    </span>
                  </td>
                  <td>
                    <p class="val-main">{{ customer.totalBookings }}</p>
                    <p class="val-sub">Lượt</p>
                  </td>
                  <td>
                    <p class="val-main price">{{ formatCurrency(customer.totalSpent) }}</p>
                  </td>
                  <td>
                    <span class="status-badge" :class="customer.status">
                      {{ customer.status === 'active' ? 'Hoạt động' : 'Đã khóa' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-more">
                      <span class="material-icons">more_vert</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right: Customer Detail Sidebar (Fixed position or sticky) -->
      <div class="customer-detail-side">
        <div class="card detail-card" v-if="selectedCustomer">
          <div class="detail-header">
            <div class="u-profile-big">
              <img :src="selectedCustomer.avatar" :alt="selectedCustomer.name" />
              <div class="u-profile-info">
                <h3>{{ selectedCustomer.name }}</h3>
                <p>{{ selectedCustomer.email }}</p>
              </div>
            </div>
          </div>

          <div class="detail-stats-grid">
            <div class="d-stat-box">
              <span class="material-icons">calendar_today</span>
              <p class="d-val">{{ selectedCustomer.totalBookings }}</p>
              <p class="d-label">Lượt đặt</p>
            </div>
            <div class="d-stat-box">
              <span class="material-icons">payments</span>
              <p class="d-val">{{ formatShortCurrency(selectedCustomer.totalSpent) }}</p>
              <p class="d-label">Tổng chi</p>
            </div>
            <div class="d-stat-box">
              <span class="material-icons">stars</span>
              <p class="d-val">{{ selectedCustomer.points }}</p>
              <p class="d-label">Điểm tích lũy</p>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">Lịch sử đặt sân gần đây</h4>
            <div class="history-list">
              <div v-for="booking in selectedCustomer.history" :key="booking.id" class="history-item">
                <div class="h-icon"><span class="material-icons">sports_soccer</span></div>
                <div class="h-text">
                  <p class="h-court">{{ booking.courtName }}</p>
                  <p class="h-date">{{ booking.date }} • {{ booking.time }}</p>
                </div>
                <div class="h-amount">{{ formatCurrency(booking.price) }}</div>
              </div>
            </div>
          </div>

          <div class="detail-actions">
            <button class="btn-detail-action message">
              <span class="material-icons">send</span>
              <span>Gửi tin nhắn</span>
            </button>
            <div class="action-row">
              <button class="btn-detail-secondary">
                <span class="material-icons">edit</span>
                <span>Sửa</span>
              </button>
              <button class="btn-detail-secondary danger">
                <span class="material-icons">block</span>
                <span>Khóa tài khoản</span>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="card detail-empty">
          <span class="material-icons">person_search</span>
          <p>Chọn một khách hàng để xem chi tiết</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OwnerCustomersView',
  data() {
    return {
      searchQuery: '',
      selectedTier: 'all',
      sortBy: 'recent',
      selectedCustomerId: 1,
      tiers: [
        { id: 'all', label: 'Tất cả' },
        { id: 'gold', label: 'Vàng' },
        { id: 'silver', label: 'Bạc' },
        { id: 'bronze', label: 'Đồng' }
      ],
      customers: [
        { 
          id: 1, 
          name: 'Nguyễn Đình Vĩ', 
          phone: '0987 654 321', 
          email: 'vi.nguyen@gmail.com',
          avatar: 'https://ui-avatars.com/api/?name=Nguyen+Dinh+Vi&background=0d9488&color=fff',
          tier: 'gold',
          totalBookings: 42,
          totalSpent: 15400000,
          status: 'active',
          isOnline: true,
          points: 1250,
          history: [
            { id: 101, courtName: 'Sân A1 (Thành Phát)', date: '18/03/2026', time: '18:00', price: 350000 },
            { id: 102, courtName: 'Sân B1 (Viettel)', date: '15/03/2026', time: '19:30', price: 450000 },
            { id: 103, courtName: 'Sân A1 (Thành Phát)', date: '10/03/2026', time: '17:00', price: 350000 }
          ]
        },
        { 
          id: 2, 
          name: 'Phan Tuấn Anh', 
          phone: '0912 333 888', 
          email: 'anh.phan@yahoo.com',
          avatar: 'https://ui-avatars.com/api/?name=Phan+Tuan+Anh&background=3b82f6&color=fff',
          tier: 'silver',
          totalBookings: 18,
          totalSpent: 6200000,
          status: 'active',
          isOnline: false,
          points: 480,
          history: [
            { id: 201, courtName: 'Sân A2 (Thành Phát)', date: '17/03/2026', time: '20:00', price: 300000 }
          ]
        },
        { 
          id: 3, 
          name: 'Lê Văn Cường', 
          phone: '0345 888 999', 
          email: 'cuong.le@outlook.com',
          avatar: 'https://ui-avatars.com/api/?name=Le+Van+Cuong&background=fbbf24&color=fff',
          tier: 'bronze',
          totalBookings: 5,
          totalSpent: 1850000,
          status: 'active',
          isOnline: true,
          points: 120,
          history: []
        },
        { 
          id: 4, 
          name: 'Hoàng Minh Thu', 
          phone: '0901 000 111', 
          email: 'thu.hoang@gmail.com',
          avatar: 'https://ui-avatars.com/api/?name=Hoang+Minh+Thu&background=ec4899&color=fff',
          tier: 'gold',
          totalBookings: 35,
          totalSpent: 12800000,
          status: 'blocked',
          isOnline: false,
          points: 980,
          history: []
        }
      ]
    }
  },
  computed: {
    selectedCustomer() {
      return this.customers.find(c => c.id === this.selectedCustomerId);
    },
    filteredCustomers() {
      let result = this.customers.filter(c => {
        const matchesQuery = c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                             c.phone.includes(this.searchQuery) ||
                             c.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesTier = this.selectedTier === 'all' || c.tier === this.selectedTier;
        return matchesQuery && matchesTier;
      });

      if (this.sortBy === 'spending') {
        result.sort((a, b) => b.totalSpent - a.totalSpent);
      } else if (this.sortBy === 'bookings') {
        result.sort((a, b) => b.totalBookings - a.totalBookings);
      }
      
      return result;
    }
  },
  methods: {
    getTierLabel(tier) {
      const labels = { gold: 'Vàng', silver: 'Bạc', bronze: 'Đồng' };
      return labels[tier] || tier;
    },
    formatCurrency(val) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    },
    formatShortCurrency(val) {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
      return val;
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

.customers-view {
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

.card {
  background: white;
  border-radius: 24px;
  border: 1px solid #eaecf2;
  box-shadow: 0 4px 20px rgba(15,22,35,0.04);
}

/* ── Header ────────────────────────────────────────────────── */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.view-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 4px 0;
  text-transform: uppercase;
}

.view-subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  background: white;
  padding: 16px 32px;
  border-radius: 20px;
  border: 1px solid #eaecf2;
}

.h-stat-item { display: flex; flex-direction: column; gap: 2px; }
.h-stat-label { font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
.h-stat-val { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 800; color: #1e293b; }
.text-green { color: #16a34a !important; }
.h-stat-divider { width: 1px; height: 40px; background: #f1f5f9; }

/* ── Toolbar ───────────────────────────────────────────────── */
.toolbar {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.search-box {
  flex: 1;
  position: relative;
  max-width: 500px;
}

.search-box span {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 14px 14px 14px 48px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  background: white;
  border-color: #16a34a;
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.08);
}

.filter-group { display: flex; gap: 32px; }
.filter-item { display: flex; align-items: center; gap: 12px; }
.filter-item label { font-size: 13px; font-weight: 700; color: #64748b; }

.tier-chips { display: flex; gap: 8px; }
.tier-chip {
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tier-chip.active.all { background: #1e293b; color: white; border-color: #1e293b; }
.tier-chip.active.gold { background: #f59e0b; color: white; border-color: #f59e0b; }
.tier-chip.active.silver { background: #94a3b8; color: white; border-color: #94a3b8; }
.tier-chip.active.bronze { background: #b45309; color: white; border-color: #b45309; }

.filter-item select {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

/* ── Customers Layout ──────────────────────────────────────── */
.customers-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: flex-start;
}

.list-card { padding: 0; overflow: hidden; }

.table-wrap { width: 100%; }
.customer-table { width: 100%; border-collapse: collapse; }
.customer-table th {
  text-align: left;
  padding: 16px 24px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #94a3b8;
  border-bottom: 2px solid #f8fafc;
}

.customer-table tbody tr {
  cursor: pointer;
  transition: all 0.2s;
}

.customer-table tbody tr:hover { background: #f8fafc; }
.customer-table tbody tr.selected { background: #f0fdf4; }

.customer-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
}

.user-info-cell { display: flex; align-items: center; gap: 16px; }
.avatar-wrap { position: relative; width: 44px; height: 44px; }
.avatar-wrap img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.online-indicator {
  position: absolute; bottom: 0; right: 0;
  width: 12px; height: 12px;
  background: #16a34a; border: 2px solid white; border-radius: 50%;
}

.u-name { font-weight: 700; font-size: 15px; margin: 0; color: #1e293b; }
.u-phone { font-size: 12px; color: #94a3b8; margin: 0; }

.tier-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}
.tier-badge.gold { background: #fffbeb; color: #b45309; }
.tier-badge.silver { background: #f1f5f9; color: #475569; }
.tier-badge.bronze { background: #fef3c7; color: #92400e; }

.val-main { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; margin: 0; color: #1e293b; }
.val-main.price { color: #16a34a; }
.val-sub { font-size: 11px; color: #94a3b8; font-weight: 700; margin: 0; }

.status-badge {
  font-size: 12px; font-weight: 600;
}
.status-badge.active { color: #16a34a; }
.status-badge.blocked { color: #ef4444; }

.btn-more {
  width: 32px; height: 32px;
  border: none; background: transparent;
  color: #94a3b8; cursor: pointer;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.btn-more:hover { background: #f1f5f9; color: #1e293b; }

/* ── Detail Sidebar ────────────────────────────────────────── */
.detail-card {
  padding: 32px;
  position: sticky;
  top: 104px;
}

.detail-header {
  text-align: center;
  margin-bottom: 32px;
}

.u-profile-big {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.u-profile-big img {
  width: 100px; height: 100px;
  border-radius: 50%;
  border: 4px solid #f8fafc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.u-profile-info h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 800; margin: 0 0 4px 0; }
.u-profile-info p { font-size: 14px; color: #64748b; margin: 0; }

.detail-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.d-stat-box {
  background: #f8fafc;
  padding: 16px 8px;
  border-radius: 16px;
  text-align: center;
}

.d-stat-box span { font-size: 20px; color: #16a34a; margin-bottom: 8px; }
.d-val { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; margin: 0; color: #1e293b; }
.d-label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin: 0; }

.section-title {
  font-size: 13px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: #94a3b8; margin: 0 0 16px 0;
}

.history-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
.history-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; background: #fff;
  border: 1px solid #f1f5f9; border-radius: 12px;
}
.h-icon { width: 36px; height: 36px; background: #f0fdf4; color: #16a34a; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.h-icon span { font-size: 18px; }
.h-text { flex: 1; }
.h-court { font-size: 13px; font-weight: 700; margin: 0; color: #1e293b; }
.h-date { font-size: 11px; color: #94a3b8; margin: 0; }
.h-amount { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 14px; color: #1e293b; }

.detail-actions { display: flex; flex-direction: column; gap: 12px; }
.btn-detail-action.message {
  width: 100%; height: 48px;
  background: #1e293b; color: white;
  border: none; border-radius: 12px;
  font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.action-row { display: flex; gap: 12px; }
.btn-detail-secondary {
  flex: 1; height: 44px;
  background: white; border: 1px solid #e2e8f0;
  border-radius: 12px; font-size: 13px; font-weight: 700;
  color: #475569; display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer;
}
.btn-detail-secondary.danger { color: #ef4444; }
.btn-detail-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

.detail-empty {
  height: 400px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: #94a3b8; gap: 16px;
}
.detail-empty span { font-size: 64px; }

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1280px) {
  .customers-layout { grid-template-columns: 1fr; }
  .customer-detail-side { display: none; } /* Could be a modal on smaller screens */
}

@media (max-width: 1024px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .filter-group { flex-wrap: wrap; }
}
</style>
