<template>
  <div class="courts-view">
    <!-- Header Section -->
    <div class="view-header">
      <div class="header-info">
        <h1 class="view-title">Quản lý Sân đấu</h1>
        <p class="view-subtitle">Thiết lập thông tin, giá cả và trạng thái từng sân.</p>
      </div>
      <button class="add-btn" @click="showAddModal = true">
        <span class="material-icons">add_circle</span>
        <span>Thêm sân mới</span>
      </button>
    </div>

    <!-- Control Bar: Club Selector & Search -->
    <div class="control-bar">
      <div class="club-selector">
        <label>Chọn câu lạc bộ:</label>
        <select v-model="selectedClubId">
          <option v-for="club in clubs" :key="club.id" :value="club.id">
            {{ club.name }}
          </option>
        </select>
      </div>
      
      <div class="search-box">
        <span class="material-icons">search</span>
        <input type="text" v-model="searchQuery" placeholder="Tìm tên sân..." />
      </div>

      <div class="filter-group">
        <select v-model="typeFilter">
          <option value="all">Tất cả loại sân</option>
          <option value="5x5">Sân 5 người</option>
          <option value="7x7">Sân 7 người</option>
          <option value="11x11">Sân 11 người</option>
        </select>
      </div>
    </div>

    <!-- Courts Grid -->
    <div class="courts-grid" v-if="filteredCourts.length > 0">
      <div v-for="(court, i) in filteredCourts" :key="court.id" class="court-card" :style="`--delay: ${i * 80}ms`">
        <div class="court-header">
          <div class="court-type-tag" :class="'type-' + court.type">
            {{ court.type === '5x5' ? 'Sân 5' : court.type === '7x7' ? 'Sân 7' : 'Sân 11' }}
          </div>
          <div class="court-status-toggle">
            <span class="status-dot" :class="court.status"></span>
            <span class="status-text">{{ getStatusText(court.status) }}</span>
          </div>
        </div>

        <div class="court-body">
          <h3 class="court-name">{{ court.name }}</h3>
          <div class="court-info">
            <div class="info-item">
              <span class="material-icons">payments</span>
              <span>{{ formatPrice(court.pricePerHour) }}/giờ</span>
            </div>
            <div class="info-item">
              <span class="material-icons">history</span>
              <span>{{ court.totalBookings }} lượt đặt</span>
            </div>
          </div>
          
          <div class="court-amenities">
            <span v-for="amenity in court.amenities" :key="amenity" class="amenity-tag">
              {{ amenity }}
            </span>
          </div>
        </div>

        <div class="court-footer">
          <button class="footer-btn edit" title="Chỉnh sửa">
            <span class="material-icons">edit</span>
            <span>Sửa</span>
          </button>
          <button class="footer-btn status" :title="court.status === 'active' ? 'Bảo trì' : 'Kích hoạt'">
            <span class="material-icons">{{ court.status === 'active' ? 'build' : 'play_arrow' }}</span>
            <span>{{ court.status === 'active' ? 'Bảo trì' : 'Mở' }}</span>
          </button>
          <button class="footer-btn delete" title="Xóa sân">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-illustration">🏟️</div>
      <h3>Không tìm thấy sân nào</h3>
      <p>Hãy thử thay đổi bộ lọc hoặc thêm sân mới cho câu lạc bộ này.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OwnerCourtsView',
  data() {
    return {
      selectedClubId: 1,
      searchQuery: '',
      typeFilter: 'all',
      showAddModal: false,
      clubs: [
        { id: 1, name: 'Sân bóng Thành Phát' },
        { id: 2, name: 'Viettel Sports Center' }
      ],
      courts: [
        { id: 1, clubId: 1, name: 'Sân A1 (Trong nhà)', type: '5x5', pricePerHour: 350000, status: 'active', totalBookings: 124, amenities: ['Mái che', 'Nước uống'] },
        { id: 2, clubId: 1, name: 'Sân A2 (Ngoài trời)', type: '5x5', pricePerHour: 300000, status: 'active', totalBookings: 89, amenities: ['Đèn LED'] },
        { id: 3, clubId: 1, name: 'Sân B1 (VIP)', type: '7x7', pricePerHour: 450000, status: 'active', totalBookings: 215, amenities: ['Mái che', 'LiveStream'] },
        { id: 4, clubId: 1, name: 'Sân C1', type: '11x11', pricePerHour: 1200000, status: 'maintenance', totalBookings: 45, amenities: ['Khán đài'] },
        { id: 5, clubId: 2, name: 'Sân Viettel 1', type: '7x7', pricePerHour: 500000, status: 'active', totalBookings: 560, amenities: ['Cỏ chuẩn FIFA'] },
      ]
    }
  },
  computed: {
    filteredCourts() {
      return this.courts.filter(court => {
        const matchesClub = court.clubId === this.selectedClubId;
        const matchesSearch = court.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesType = this.typeFilter === 'all' || court.type === this.typeFilter;
        return matchesClub && matchesSearch && matchesType;
      });
    }
  },
  methods: {
    getStatusText(status) {
      return status === 'active' ? 'Sẵn sàng' : status === 'maintenance' ? 'Bảo trì' : 'Đang bận';
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

.courts-view {
  font-family: 'Barlow Condensed', sans-serif;
  color: #0f1623;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.view-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.view-subtitle {
  font-family: 'DM Sans', sans-serif;
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #16a34a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}

.add-btn:hover {
  background-color: #15803d;
  transform: translateY(-2px);
}

/* Control Bar */
.control-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #eaecf2;
  align-items: flex-end;
}

.club-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 240px;
}

.club-selector label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.club-selector select, .filter-group select {
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  cursor: pointer;
  background-color: #f8fafc;
}

.search-box {
  flex: 1;
  position: relative;
  min-width: 200px;
}

.search-box span {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 46px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  background-color: #f8fafc;
}

.search-box input:focus {
  outline: none;
  border-color: #16a34a;
  background-color: white;
}

/* Courts Grid */
.courts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.court-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #eaecf2;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  animation: fadeSlideUp 0.5s ease both;
  animation-delay: var(--delay, 0ms);
}

.court-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.06);
  border-color: #cbd5e1;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.court-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #f1f5f9;
}

.court-type-tag {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}
.court-type-tag.type-5x5 { background: #eff6ff; color: #2563eb; }
.court-type-tag.type-7x7 { background: #faf5ff; color: #9333ea; }
.court-type-tag.type-11x11 { background: #fff7ed; color: #ea580c; }

.court-status-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-dot.active { background: #16a34a; box-shadow: 0 0 6px rgba(22, 163, 74, 0.4); }
.status-dot.maintenance { background: #94a3b8; }

.status-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.court-body {
  padding: 24px 20px;
  flex: 1;
}

.court-name {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 16px 0;
  color: #1e293b;
}

.court-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #475569;
}

.info-item span.material-icons {
  font-size: 18px;
  color: #94a3b8;
}

.court-amenities {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.amenity-tag {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 6px;
}

.court-footer {
  padding: 16px 20px;
  background: #f8fafc;
  display: flex;
  gap: 8px;
}

.footer-btn {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s;
}

.footer-btn.edit { flex: 1.5; color: #1e293b; }
.footer-btn.status { flex: 1.5; color: #16a34a; }
.footer-btn.delete { flex: 1; color: #ef4444; }

.footer-btn:hover { background: #f1f5f9; transform: translateY(-1px); }
.footer-btn.delete:hover { background: #fef2f2; border-color: #fecaca; }

.empty-state {
  text-align: center;
  padding: 100px 0;
  background: white;
  border-radius: 20px;
  border: 2px dashed #eaecf2;
}

.empty-illustration {
  font-size: 60px;
  margin-bottom: 20px;
}

@media (max-width: 640px) {
  .view-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .control-bar { flex-direction: column; align-items: stretch; }
  .courts-grid { grid-template-columns: 1fr; }
}
</style>
