<template>
  <div class="clubs-view">
    <!-- Header Section -->
    <div class="view-header">
      <div class="header-info">
        <h1 class="view-title">Quản lý Câu lạc bộ</h1>
        <p class="view-subtitle">Danh sách các cơ sở thể thao do bạn làm chủ.</p>
      </div>
      <button class="add-btn" @click="showAddModal = true">
        <span class="material-icons">add_circle</span>
        <span>Thêm câu lạc bộ mới</span>
      </button>
    </div>

    <!-- Filter/Search Bar (Optional but good) -->
    <div class="search-bar">
      <div class="input-wrap">
        <span class="material-icons search-icon">search</span>
        <input type="text" v-model="searchQuery" placeholder="Tìm kiếm theo tên hoặc địa chỉ..." />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm ngưng</option>
          <option value="pending">Chờ duyệt</option>
        </select>
      </div>
    </div>

    <!-- Clubs Grid -->
    <div class="clubs-grid" v-if="filteredClubs.length > 0">
      <div v-for="(club, i) in filteredClubs" :key="club.id" class="club-card" :style="`--delay: ${i * 100}ms`">
        <div class="club-image">
          <img :src="club.image" :alt="club.name" />
          <div class="status-badge" :class="club.status">
            {{ getStatusText(club.status) }}
          </div>
          <div class="image-overlay">
            <button class="overlay-btn" title="Chỉnh sửa ảnh">
              <span class="material-icons">photo_camera</span>
            </button>
          </div>
        </div>
        
        <div class="club-details">
          <div class="club-main">
            <h3 class="club-name">{{ club.name }}</h3>
            <p class="club-manager">ID: {{ club.clubId }}</p>
          </div>

          <div class="info-row">
            <span class="material-icons info-icon">location_on</span>
            <span class="info-text">{{ club.address }}</span>
          </div>

          <div class="info-row">
            <span class="material-icons info-icon">schedule</span>
            <span class="info-text">Giờ mở cửa: {{ club.openTime }} - {{ club.closeTime }}</span>
          </div>

          <div class="club-stats">
            <div class="stat-item">
              <span class="stat-num">{{ club.totalCourts }}</span>
              <span class="stat-label">Sân đấu</span>
            </div>
            <div class="stat-item">
              <div class="rating-box">
                <span class="stat-num">{{ club.rating }}</span>
                <span class="material-icons star-icon">star</span>
              </div>
              <span class="stat-label">{{ club.reviewCount }} đánh giá</span>
            </div>
          </div>

          <div class="club-actions">
            <router-link :to="`/owner/clubs/${club.id}/edit`" class="btn-action edit">
              <span class="material-icons">edit</span>
              <span>Chỉnh sửa</span>
            </router-link>
            <router-link :to="`/owner/courts?clubId=${club.id}`" class="btn-action manage">
              <span class="material-icons">sports_soccer</span>
              <span>Quản lý sân</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <span class="material-icons">business</span>
      </div>
      <h3>Chưa có câu lạc bộ nào</h3>
      <p>Bạn chưa thêm cơ sở kinh doanh nào vào hệ thống.</p>
      <button class="add-btn mt-20" @click="showAddModal = true">
        <span class="material-icons">add_circle</span>
        <span>Thêm câu lạc bộ ngay</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OwnerClubsView',
  data() {
    return {
      searchQuery: '',
      statusFilter: 'all',
      showAddModal: false,
      clubs: [
        {
          id: 1,
          clubId: 'CLB-001',
          name: 'Sân bóng Thành Phát',
          address: '123 Phạm Hùng, Cầu Giấy, Hà Nội',
          image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600',
          status: 'active',
          openTime: '06:00',
          closeTime: '23:00',
          totalCourts: 6,
          rating: 4.8,
          reviewCount: 382
        },
        {
          id: 2,
          clubId: 'CLB-002',
          name: 'Viettel Sports Center',
          address: 'Ngõ 155 Trường Chinh, Thanh Xuân, Hà Nội',
          image: 'https://images.unsplash.com/photo-1459865264687-595d654dfbb5?auto=format&fit=crop&q=80&w=600',
          status: 'active',
          openTime: '05:00',
          closeTime: '22:00',
          totalCourts: 12,
          rating: 4.9,
          reviewCount: 1540
        },
        {
          id: 3,
          clubId: 'CLB-003',
          name: 'Sân bóng Chu Văn An',
          address: 'Tây Hồ, Hà Nội (Đang sửa chữa)',
          image: 'https://images.unsplash.com/photo-1529900748604-07564d024be1?auto=format&fit=crop&q=80&w=600',
          status: 'inactive',
          openTime: '06:00',
          closeTime: '22:30',
          totalCourts: 4,
          rating: 4.5,
          reviewCount: 89
        }
      ]
    }
  },
  computed: {
    filteredClubs() {
      return this.clubs.filter(club => {
        const matchesSearch = club.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                             club.address.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus = this.statusFilter === 'all' || club.status === this.statusFilter;
        return matchesSearch && matchesStatus;
      });
    }
  },
  methods: {
    getStatusText(status) {
      const statuses = {
        active: 'Đang hoạt động',
        inactive: 'Tạm ngưng',
        pending: 'Chờ duyệt'
      };
      return statuses[status] || status;
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');

.clubs-view {
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
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 4px 0;
}

.view-subtitle {
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

/* Search and Filter */
.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  background: white;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid #eaecf2;
}

.input-wrap {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.input-wrap input {
  width: 100%;
  padding: 12px 12px 12px 46px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.input-wrap input:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.filter-group select {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
}

/* Clubs Grid */
.clubs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.club-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #eaecf2;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeSlideUp 0.5s ease both;
  animation-delay: var(--delay, 0ms);
}

.club-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.club-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.club-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.club-card:hover .club-image img {
  transform: scale(1.1);
}

.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  z-index: 2;
  backdrop-filter: blur(8px);
}

.status-badge.active { background: rgba(22, 163, 74, 0.9); color: white; }
.status-badge.inactive { background: rgba(148, 163, 184, 0.9); color: white; }
.status-badge.pending { background: rgba(245, 158, 11, 0.9); color: white; }

.image-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.club-image:hover .image-overlay { opacity: 1; }

.overlay-btn {
  background: rgba(255,255,255,0.9);
  border: none;
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #1a1a2e;
}

.club-details {
  padding: 24px;
}

.club-main {
  margin-bottom: 20px;
  font-family: 'Barlow Condensed', sans-serif;
}

.club-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.club-manager {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.info-icon {
  font-size: 18px;
  color: #94a3b8;
}

.info-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.4;
}

.club-stats {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-weight: 800;
  font-size: 16px;
  color: #1a1a2e;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-icon {
  font-size: 16px;
  color: #f59e0b;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.club-actions {
  display: flex;
  gap: 12px;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-action.edit {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-action.edit:hover {
  background: #e2e8f0;
}

.btn-action.manage {
  background: #f0fdf4;
  color: #16a34a;
}

.btn-action.manage:hover {
  background: #dcfce7;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  background: white;
  border-radius: 20px;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  width: 80px; height: 80px;
  background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  margin-bottom: 24px;
}

.empty-icon span { font-size: 40px; color: #94a3b8; }

.mt-20 { margin-top: 20px; }

@media (max-width: 640px) {
  .clubs-grid { grid-template-columns: 1fr; }
  .view-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .search-bar { flex-direction: column; }
}
</style>
