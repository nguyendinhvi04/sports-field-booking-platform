<template>
  <div class="premium-customers-layout p-fade-in">
    <!-- Header with Dynamic Gradient -->
    <header class="pc-header">
      <div class="pc-title-wrapper">
        <h1 class="pc-title">Quản Lý Khách Hàng</h1>
        <p class="pc-subtitle">Hệ thống theo dõi khách hàng thân thiết cao cấp</p>
      </div>
      
      <!-- Premium Stats Cards -->
      <div class="pc-stats-grid">
        <div class="pc-stat-glass">
          <div class="stat-icon-wrap bg-blue"><span class="material-icons">groups</span></div>
          <div class="stat-info">
            <span class="stat-value">2,840</span>
            <span class="stat-label">Tổng khách</span>
          </div>
        </div>
        <div class="pc-stat-glass">
          <div class="stat-icon-wrap bg-green"><span class="material-icons">trending_up</span></div>
          <div class="stat-info">
            <span class="stat-value">+142</span>
            <span class="stat-label">Khách mới (Tháng)</span>
          </div>
        </div>
        <div class="pc-stat-glass">
          <div class="stat-icon-wrap bg-purple"><span class="material-icons">diamond</span></div>
          <div class="stat-info">
            <span class="stat-value">315</span>
            <span class="stat-label">Khách VIP</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Toolbar: Search & Filters inside Glass Panel -->
    <div class="pc-toolbar pc-glass-panel">
      <div class="pc-search-box">
        <span class="material-icons search-icon">search</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Tìm kiếm khách hàng (Tên, Email, SĐT)..." 
          class="pc-search-input"
        />
        <div class="search-glow"></div>
      </div>
      
      <div class="pc-filters">
        <div class="pc-tier-filters-wrapper">
          <div class="pc-tier-filters">
            <button 
              v-for="tier in tiers" 
              :key="tier.id" 
              class="pc-tier-btn"
              :class="[`tier-${tier.id}`, { active: selectedTier === tier.id }]"
              @click="selectedTier = tier.id"
            >
              {{ tier.label }}
            </button>
          </div>
        </div>
        
        <div class="pc-select-wrapper">
          <span class="material-icons select-icon">sort</span>
          <select v-model="sortBy" class="pc-select">
            <option value="recent">Mới tương tác</option>
            <option value="spending">Chi tiêu cao</option>
            <option value="bookings">Lượt đặt nhiều</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="pc-main-grid">
      
      <!-- Left: Customers Table -->
      <div class="pc-list-container pc-glass-panel">
        <div class="table-scroll-wrapper">
          <table class="pc-table">
            <thead>
              <tr>
                <th>Khách Hàng</th>
                <th>Phân Hạng</th>
                <th>Lượt Đặt</th>
                <th>Tổng Chi Tiêu</th>
                <th>Trạng Thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(customer, index) in filteredCustomers" 
                :key="customer.id"
                class="pc-table-row"
                :class="{ 'row-selected': selectedCustomerId === customer.id }"
                @click="selectedCustomerId = customer.id"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <td>
                  <div class="pc-user-cell">
                    <div class="pc-avatar-ring" :class="`ring-${customer.tier}`">
                      <img :src="customer.avatar" :alt="customer.name" class="pc-avatar" />
                      <div v-if="customer.isOnline" class="online-dot"></div>
                    </div>
                    <div class="pc-user-text">
                      <h4 class="pc-name">{{ customer.name }}</h4>
                      <p class="pc-phone">{{ customer.phone }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="pc-badge" :class="`badge-${customer.tier}`">
                    <span class="material-icons tier-icon">{{ getTierIcon(customer.tier) }}</span>
                    {{ getTierLabel(customer.tier) }}
                  </div>
                </td>
                <td>
                  <div class="pc-number-box">
                    <span class="pc-num-main">{{ customer.totalBookings }}</span>
                  </div>
                </td>
                <td>
                  <div class="pc-currency-box">
                    <span class="pc-money">{{ formatShortCurrency(customer.totalSpent) }}</span>
                  </div>
                </td>
                <td>
                  <div class="pc-status" :class="`status-${customer.status}`">
                    <div class="status-indicator"></div>
                    {{ customer.status === 'active' ? 'Hoạt động' : 'Tạm khóa' }}
                  </div>
                </td>
                <td>
                  <button class="pc-icon-btn"><span class="material-icons">chevron_right</span></button>
                </td>
              </tr>
              
              <tr v-if="filteredCustomers.length === 0">
                <td colspan="6" class="pc-empty-cell">
                  <div class="empty-state">
                    <span class="material-icons">sentiment_dissatisfied</span>
                    <p>Không tìm thấy khách hàng nào</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right: Customer Detail Panel -->
      <div class="pc-detail-sidebar" @click.self="selectedCustomerId = null">
        <transition name="sliding-fade" mode="out-in">
          <div v-if="selectedCustomer" :key="selectedCustomer.id" class="pc-detail-glass">
            
            <!-- Detail Header Cover -->
            <div class="detail-cover" :class="`cover-${selectedCustomer.tier}`">
              <div class="cover-gradient"></div>
              <button class="mobile-close-btn" @click="selectedCustomerId = null">
                <span class="material-icons">close</span>
              </button>
            </div>
            
            <div class="detail-profile-section">
              <div class="detail-avatar-wrap">
                <img :src="selectedCustomer.avatar" alt="Avatar" />
              </div>
              <h2 class="d-name">{{ selectedCustomer.name }}</h2>
              <p class="d-email">{{ selectedCustomer.email }}</p>
              
              <div class="pc-badge mx-auto mt-2" :class="`badge-${selectedCustomer.tier}`">
                <span class="material-icons tier-icon">{{ getTierIcon(selectedCustomer.tier) }}</span>
                Thành viên {{ getTierLabel(selectedCustomer.tier) }}
              </div>
            </div>

            <!-- Detail Stats -->
            <div class="d-stats-flex">
              <div class="d-s-item">
                <span class="material-icons s-icon text-blue">monetization_on</span>
                <span class="s-val">{{ formatShortCurrency(selectedCustomer.totalSpent) }}</span>
                <span class="s-lbl">Tổng chi</span>
              </div>
              <div class="d-s-divider"></div>
              <div class="d-s-item">
                <span class="material-icons s-icon text-purple">confirmation_number</span>
                <span class="s-val">{{ selectedCustomer.totalBookings }}</span>
                <span class="s-lbl">Lượt đặt</span>
              </div>
              <div class="d-s-divider"></div>
              <div class="d-s-item">
                <span class="material-icons s-icon text-orange">stars</span>
                <span class="s-val">{{ selectedCustomer.points }}</span>
                <span class="s-lbl">Tích điểm</span>
              </div>
            </div>

            <!-- Recent History -->
            <div class="d-history-section">
              <h3 class="d-section-title">Lịch sử sân bóng</h3>
              <div class="d-timeline">
                <div v-for="(history, i) in selectedCustomer.history" :key="i" class="d-timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h4>{{ history.courtName }}</h4>
                    <p>{{ history.date }} • {{ history.time }}</p>
                  </div>
                  <div class="timeline-price">{{ formatShortCurrency(history.price) }}</div>
                </div>
                <div v-if="!selectedCustomer.history.length" class="empty-timeline">
                   Chưa có lịch sử giao dịch
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-action-group">
              <button class="pc-btn-primary w-full" @click="openMessageModal">
                <span class="material-icons">forum</span> Nhắn tin
              </button>
              <div class="d-action-row mt-3">
                <button class="pc-btn-outline flex-1" @click="openEditModal">
                  <span class="material-icons">edit</span> Sửa thông tin
                </button>
                <button class="pc-btn-outline flex-1" :class="{ danger: selectedCustomer.status !== 'blocked', safe: selectedCustomer.status === 'blocked' }" @click="toggleBlockStatus">
                  <span class="material-icons">{{ selectedCustomer.status === 'blocked' ? 'lock_open' : 'block' }}</span>
                  {{ selectedCustomer.status === 'blocked' ? 'Mở Khóa' : 'Khóa TK' }}
                </button>
              </div>
            </div>
            
          </div>
          
          <div v-else class="pc-detail-glass empty-detail">
            <div class="floating-icon-wrap">
              <span class="material-icons floating-icon">manage_accounts</span>
            </div>
            <h3>Chọn Khách Hàng</h3>
            <p>Bấm vào một tài khoản bên trái để xem thông tin chi tiết.</p>
          </div>
        </transition>
      </div>

    </div>

    <!-- Edit Modal (Premium Glass) -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showEditModal" class="pc-modal-backdrop" @click.self="showEditModal = false">
          <div class="pc-modal-content pc-glass-panel">
            <div class="modal-header">
              <div class="modal-title-group">
                 <span class="material-icons modal-icon text-blue">edit_note</span>
                 <h3>Cập nhật Hồ sơ</h3>
              </div>
              <button class="pc-icon-btn" @click="showEditModal = false"><span class="material-icons">close</span></button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>Phân hạng thành viên</label>
                <div class="pc-select-wrapper">
                  <span class="material-icons select-icon">military_tech</span>
                  <select v-model="editForm.tier" class="pc-search-input ml-0 w-full pl-10" style="padding-left: 40px; margin-left:0; width: 100%;">
                    <option value="normal">Khách Thường</option>
                    <option value="bronze">Khách Bronze</option>
                    <option value="silver">Khách Silver</option>
                    <option value="gold">Khách Gold</option>
                    <option value="vip">Khách VIP</option>
                  </select>
                </div>
              </div>
              <div class="form-group mt-3">
                <label>Ghi chú cá nhân (Chỉ mình bạn xem)</label>
                <textarea v-model="editForm.notes" class="pc-search-input w-full mt-1" rows="4" placeholder="VD: Thích đặt sân số 1..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="pc-btn-outline" @click="showEditModal = false">Hủy Bỏ</button>
              <button class="pc-btn-primary" @click="saveEdit" style="margin-left: 12px;">Lưu Thay Đổi</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Chat Modal (Premium Glass) -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showMessageModal" class="pc-modal-backdrop" @click.self="showMessageModal = false">
          <div class="pc-modal-content pc-glass-panel">
            <div class="modal-header">
              <div class="modal-title-group">
                 <span class="material-icons modal-icon text-green">forum</span>
                 <h3>Soạn Tin Nhắn</h3>
              </div>
              <button class="pc-icon-btn" @click="showMessageModal = false"><span class="material-icons">close</span></button>
            </div>
            
            <div class="modal-body">
              <div class="chat-target">
                 <span>Gửi tới:</span>
                 <div class="chat-badge"><span class="material-icons">person</span> {{ selectedCustomer?.name }}</div>
              </div>
              <div class="form-group mt-3">
                <textarea v-model="messageBody" class="pc-search-input w-full" rows="5" placeholder="Nhập nội dung tin nhắn gửi khách hàng..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="pc-btn-outline" @click="showMessageModal = false">Đóng</button>
              <button class="pc-btn-primary bg-green" @click="sendMessage" style="margin-left: 12px;">
                <span class="material-icons">send</span> Gửi Ngay
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script>
export default {
  name: 'PremiumCustomersView',
  data() {
    return {
      searchQuery: '',
      selectedTier: 'all',
      sortBy: 'recent',
      selectedCustomerId: null,
      showEditModal: false,
      showMessageModal: false,
      messageBody: '',
      editForm: {
        id: null,
        tier: 'normal',
        notes: ''
      },
      tiers: [
        { id: 'all', label: 'Tất cả' },
        { id: 'vip', label: 'VIP' },
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
          avatar: 'https://ui-avatars.com/api/?name=Nguyen+Dinh+Vi&background=0284c7&color=fff',
          tier: 'vip',
          totalBookings: 85,
          totalSpent: 45000000,
          status: 'active',
          isOnline: true,
          points: 4500,
          notes: 'Đại gia chuyên bao sân VIP cho anh em.',
          history: [
            { id: 101, courtName: 'Sân VIP 1 (Thành Phát)', date: '18/03/2026', time: '18:00', price: 500000 },
            { id: 102, courtName: 'Sân 7 (Viettel)', date: '15/03/2026', time: '19:30', price: 800000 },
            { id: 103, courtName: 'Sân VIP 1 (Thành Phát)', date: '10/03/2026', time: '17:00', price: 500000 }
          ]
        },
        { 
          id: 2, 
          name: 'Phan Tuấn Anh', 
          phone: '0912 333 888', 
          email: 'anh.phan@yahoo.com',
          avatar: 'https://ui-avatars.com/api/?name=Phan+Tuan+Anh&background=16a34a&color=fff',
          tier: 'gold',
          totalBookings: 32,
          totalSpent: 12500000,
          status: 'active',
          isOnline: false,
          points: 1250,
          history: [
            { id: 201, courtName: 'Sân 5 số 2', date: '17/03/2026', time: '20:00', price: 300000 },
            { id: 202, courtName: 'Sân 5 số 2', date: '14/03/2026', time: '20:00', price: 300000 }
          ]
        },
        { 
          id: 3, 
          name: 'Lê Văn Cường', 
          phone: '0345 888 999', 
          email: 'cuong.le@outlook.com',
          avatar: 'https://ui-avatars.com/api/?name=Le+Van+Cuong&background=f59e0b&color=fff',
          tier: 'silver',
          totalBookings: 15,
          totalSpent: 4800000,
          status: 'active',
          isOnline: true,
          points: 480,
          history: [
             { id: 301, courtName: 'Sân cầu lông số 1', date: '10/03/2026', time: '18:00', price: 120000 }
          ]
        },
        { 
          id: 4, 
          name: 'Hoàng Minh Thu', 
          phone: '0901 000 111', 
          email: 'thu.hoang@gmail.com',
          avatar: 'https://ui-avatars.com/api/?name=Hoang+Minh+Thu&background=6d28d9&color=fff',
          tier: 'bronze',
          totalBookings: 3,
          totalSpent: 900000,
          status: 'blocked',
          isOnline: false,
          points: 90,
          history: []
        },
        { 
          id: 5, 
          name: 'Trương Tuấn Tú', 
          phone: '0988 123 456', 
          email: 'tutuong102@gmail.com',
          avatar: 'https://ui-avatars.com/api/?name=Truong+Tuan+Tu&background=e11d48&color=fff',
          tier: 'silver',
          totalBookings: 19,
          totalSpent: 5200000,
          status: 'active',
          isOnline: true,
          points: 520,
          history: [
            { id: 501, courtName: 'Sân tennis A', date: '19/03/2026', time: '06:00', price: 200000 }
          ]
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
    openEditModal() {
      if(!this.selectedCustomer) return;
      this.editForm = {
        id: this.selectedCustomer.id,
        tier: this.selectedCustomer.tier || 'normal',
        notes: this.selectedCustomer.notes || ''
      };
      this.showEditModal = true;
    },
    saveEdit() {
      // Tìm index của customer và cập nhật
      const index = this.customers.findIndex(c => c.id === this.editForm.id);
      if(index !== -1) {
        this.customers[index].tier = this.editForm.tier;
        this.customers[index].notes = this.editForm.notes;
      }
      this.showEditModal = false;
      alert("Cập nhật thông tin thành công!");
    },
    toggleBlockStatus() {
      if(!this.selectedCustomer) return;
      const isBlocked = this.selectedCustomer.status === 'blocked';
      const action = isBlocked ? "mở khóa" : "khóa";
      if(confirm(`Bạn chắc chắn muốn ${action} tài khoản ${this.selectedCustomer.name}? Lựa chọn này sẽ cấm đặt sân tại CLB của bạn.`)) {
        const index = this.customers.findIndex(c => c.id === this.selectedCustomer.id);
        if(index !== -1) {
          this.customers[index].status = isBlocked ? 'active' : 'blocked';
        }
      }
    },
    openMessageModal() {
      if(!this.selectedCustomer) return;
      this.messageBody = '';
      this.showMessageModal = true;
    },
    sendMessage() {
      if(!this.messageBody.trim()) {
        alert("Vui lòng nhập nội dung tin nhắn");
        return;
      }
      alert(`Đã gửi tin nhắn tới ${this.selectedCustomer.name}: "${this.messageBody}"`);
      this.showMessageModal = false;
    },
    getTierLabel(tier) {
      const labels = { vip: 'VIP', gold: 'Vàng', silver: 'Bạc', bronze: 'Đồng' };
      return labels[tier] || tier;
    },
    getTierIcon(tier) {
      const icons = { vip: 'diamond', gold: 'workspace_premium', silver: 'military_tech', bronze: 'star' };
      return icons[tier] || 'person';
    },
    formatCurrency(val) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    },
    formatShortCurrency(val) {
      if (val >= 1000000) return (val / 1000000).toFixed(2).replace(/\.00$/, '') + ' Triệu';
      if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
      return val + 'đ';
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

/* Base Styles & Variables */
.premium-customers-layout {
  font-family: 'Outfit', sans-serif;
  min-height: calc(100vh - 80px); /* Adjust based on navbar height */
  background: radial-gradient(circle at top right, #e0e7ff 0%, #f1f5f9 40%, #f8fafc 100%);
  padding: 30px;
  color: #1e293b;
  overflow-x: hidden;
}

.p-fade-in {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Glassmorphism Panel */
.pc-glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.05), inset 0 2px 0 rgba(255, 255, 255, 0.9);
}

/* --- Header Section --- */
.pc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.pc-title {
  font-size: 36px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #0f172a 0%, #475569 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.pc-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 5px 0 0 0;
  font-weight: 500;
}

.pc-stats-grid {
  display: flex;
  gap: 16px;
}

.pc-stat-glass {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px -5px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.pc-stat-glass:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.9);
}

.stat-icon-wrap {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: white;
}
.bg-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.bg-green { background: linear-gradient(135deg, #10b981, #059669); }
.bg-purple { background: linear-gradient(135deg, #a855f7, #7e22ce); }

.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.1; }
.stat-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

/* --- Toolbar --- */
.pc-toolbar {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
  flex-wrap: wrap;
}

.pc-search-box {
  position: relative;
  flex: 1;
  max-width: 450px;
}

.search-icon {
  position: absolute;
  left: 16px; top: 50%; transform: translateY(-50%);
  color: #94a3b8; z-index: 2; pointer-events: none;
}

.pc-search-input {
  width: 100%;
  padding: 14px 14px 14px 44px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px; font-weight: 500; color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; z-index: 1;
}

.pc-search-input:focus {
  outline: none;
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.pc-filters {
  display: flex; align-items: center; gap: 24px;
}

.pc-tier-filters-wrapper {
  overflow-x: auto;
  max-width: 100%;
}
.pc-tier-filters-wrapper::-webkit-scrollbar { display: none; } /* Hide scrollbar for a cleaner look */

.pc-tier-filters {
  display: inline-flex; gap: 8px;
  background: rgba(241, 245, 249, 0.6);
  padding: 6px;
  border-radius: 12px;
  width: max-content;
}

.pc-tier-btn {
  padding: 8px 16px;
  border-radius: 8px; border: none;
  font-family: inherit; font-size: 13px; font-weight: 600;
  color: #64748b; background: transparent;
  cursor: pointer; transition: all 0.2s;
  white-space: nowrap; flex-shrink: 0;
}

.pc-tier-btn:hover { color: #1e293b; }

.pc-tier-btn.active.tier-all { background: white; color: #1e293b; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.pc-tier-btn.active.tier-vip { background: linear-gradient(135deg, #a855f7, #7e22ce); color: white; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3); }
.pc-tier-btn.active.tier-gold { background: linear-gradient(135deg, #fbbf24, #d97706); color: white; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3); }
.pc-tier-btn.active.tier-silver { background: linear-gradient(135deg, #94a3b8, #64748b); color: white; box-shadow: 0 4px 12px rgba(148, 163, 184, 0.3); }
.pc-tier-btn.active.tier-bronze { background: linear-gradient(135deg, #d97706, #92400e); color: white; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3); }

.pc-select-wrapper { position: relative; }
.select-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #64748b; pointer-events: none; }
.pc-select {
  appearance: none;
  padding: 12px 36px 12px 38px;
  background: white; border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px; font-family: inherit; font-size: 14px; font-weight: 600; color: #1e293b;
  cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.pc-select:focus { outline: none; border-color: #3b82f6; }

/* --- Grid & Table --- */
.pc-main-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: flex-start;
}

.pc-list-container {
  overflow: hidden;
  padding: 0;
}

.table-scroll-wrapper { width: 100%; overflow-x: auto; }
.pc-table { width: 100%; border-collapse: collapse; }
.pc-table th {
  padding: 18px 24px; text-align: left;
  font-size: 12px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  background: rgba(248, 250, 252, 0.4);
  white-space: nowrap;
}

.pc-table td {
  padding: 16px 24px;
  vertical-align: middle;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
  white-space: nowrap;
}

.pc-table-row {
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.pc-table-row:hover { background: rgba(255, 255, 255, 0.8); transform: scale(1.005); box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.pc-table-row.row-selected { background: rgba(59, 130, 246, 0.05); }
.pc-table-row.row-selected td { border-bottom-color: rgba(59, 130, 246, 0.1); }

/* Table Info */
.pc-user-cell { display: flex; align-items: center; gap: 16px; }

.pc-avatar-ring {
  width: 48px; height: 48px; position: relative;
  border-radius: 50%; padding: 2px;
  background: #e2e8f0; /* Default */
  flex-shrink: 0;
}
.pc-avatar-ring.ring-vip { background: linear-gradient(135deg, #c084fc, #7e22ce); }
.pc-avatar-ring.ring-gold { background: linear-gradient(135deg, #fcd34d, #d97706); }
.pc-avatar-ring.ring-silver { background: linear-gradient(135deg, #cbd5e1, #64748b); }

.pc-avatar { width: 100%; height: 100%; border-radius: 50%; border: 2px solid white; object-fit: cover; }
.online-dot { position: absolute; bottom: 0; right: 2px; width: 12px; height: 12px; background: #10b981; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.pc-user-text { display: flex; flex-direction: column; gap: 2px; white-space: nowrap; }
.pc-name { margin: 0; font-size: 15px; font-weight: 700; color: #1e293b; }
.pc-phone { margin: 0; font-size: 13px; color: #64748b; font-weight: 500; }

.pc-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 100px;
  font-size: 12px; font-weight: 700;
}
.tier-icon { font-size: 16px; }
.badge-vip { background: #f3e8ff; color: #7e22ce; }
.badge-gold { background: #fef3c7; color: #b45309; }
.badge-silver { background: #f1f5f9; color: #475569; }
.badge-bronze { background: #ffedd5; color: #9a3412; }

.pc-number-box { background: rgba(248, 250, 252, 0.8); padding: 6px 16px; border-radius: 8px; display: inline-block; }
.pc-num-main { font-size: 16px; font-weight: 400; color: #0f172a; }

.pc-currency-box { display: flex; align-items: center; gap: 6px; }
.pc-money { font-size: 15px; font-weight: 400; color: #1e293b; letter-spacing: 0.5px; }

.pc-status { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 400; color: #64748b; }
.status-indicator { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-active .status-indicator { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
.status-blocked .status-indicator { background: #ef4444; }
.status-active { color: #10b981; }
.status-blocked { color: #ef4444; }

.pc-icon-btn { width: 32px; height: 32px; border-radius: 50%; background: white; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.pc-table-row:hover .pc-icon-btn { background: #f8fafc; color: #1e293b; transform: translateX(2px); }

/* --- Detail Sidebar --- */
.pc-detail-sidebar {
  position: sticky;
  top: 100px; /* offset from header */
}

.pc-detail-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 15px 50px -10px rgba(15, 23, 42, 0.1), inset 0 2px 0 rgba(255, 255, 255, 0.9);
  display: flex; flex-direction: column;
}

.sliding-fade-enter-active, .sliding-fade-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.sliding-fade-enter-from { opacity: 0; transform: translateX(30px) scale(0.98); }
.sliding-fade-leave-to { opacity: 0; transform: translateX(-30px) scale(0.98); }

/* Detail Cover */
.detail-cover { height: 120px; width: 100%; position: relative; }
.cover-gradient { width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1)); position: absolute; bottom: 0; }
.cover-vip { background: linear-gradient(135deg, #c084fc, #fbcfe8); }
.cover-gold { background: linear-gradient(135deg, #fde68a, #fed7aa); }
.cover-silver { background: linear-gradient(135deg, #e2e8f0, #f1f5f9); }
.cover-bronze { background: linear-gradient(135deg, #fdba74, #fecaca); }

.detail-profile-section {
  text-align: center;
  margin-top: -50px;
  padding: 0 24px 24px 24px;
  position: relative; z-index: 2;
}

.detail-avatar-wrap {
  width: 96px; height: 96px; margin: 0 auto 16px auto;
  border-radius: 50%; padding: 4px; background: white;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.detail-avatar-wrap img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

.d-name { font-size: 22px; font-weight: 400; color: #0f172a; margin: 0 0 4px 0; }
.d-email { font-size: 14px; color: #64748b; margin: 0; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mt-2 { margin-top: 12px; }
.mt-3 { margin-top: 16px; }

/* Detail Stats Flex */
.d-stats-flex {
  display: flex; align-items: center; justify-content: center;
  padding: 20px 0; border-top: 1px solid rgba(226, 232, 240, 0.6); border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  background: rgba(248, 250, 252, 0.4);
}

.d-s-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.d-s-divider { width: 1px; height: 40px; background: rgba(226, 232, 240, 0.8); }

.s-icon { font-size: 24px; margin-bottom: 4px; }
.text-blue { color: #3b82f6; }
.text-purple { color: #8b5cf6; }
.text-orange { color: #f59e0b; }

.s-val { font-size: 20px; font-weight: 500; color: #1e293b; line-height: 1; }
.s-lbl { font-size: 11px; font-weight: 500; color: #94a3b8; text-transform: uppercase; }

/* Detail History */
.d-history-section { padding: 24px; }
.d-section-title { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; }

.d-timeline { display: flex; flex-direction: column; gap: 16px; position: relative; }
.d-timeline::before { content: ''; position: absolute; left: 6px; top: 10px; bottom: 10px; width: 2px; background: rgba(226, 232, 240, 0.8); }

.d-timeline-item { display: flex; align-items: flex-start; gap: 16px; position: relative; z-index: 1; }
.timeline-dot { width: 14px; height: 14px; background: #3b82f6; border: 3px solid white; border-radius: 50%; margin-top: 4px; flex-shrink: 0; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); }
.timeline-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.timeline-content h4 { margin: 0; font-size: 14px; font-weight: 700; color: #1e293b; }
.timeline-content p { margin: 0; font-size: 12px; color: #64748b; }
.timeline-price { font-size: 14px; font-weight: 800; color: #0f172a; }

.empty-timeline { font-size: 13px; color: #94a3b8; padding-left: 20px; font-style: italic; }

/* Detail Actions */
.d-action-group { padding: 0 24px 24px 24px; display: flex; flex-direction: column; }
.w-full { width: 100%; }
.flex-1 { flex: 1; display: flex; align-items: center; justify-content: center; }
.d-action-row { display: flex; gap: 12px; }

.pc-btn-primary {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white;
  border: none; padding: 14px 20px; border-radius: 12px;
  font-family: inherit; font-size: 15px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(15, 23, 42, 0.2);
}
.pc-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.3); }

.pc-btn-outline {
  background: white; color: #475569;
  border: 1px solid rgba(226, 232, 240, 0.8); padding: 12px; border-radius: 12px;
  font-family: inherit; font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}
.pc-btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
.pc-btn-outline.danger { color: #ef4444; }
.pc-btn-outline.danger:hover { background: #fef2f2; border-color: #fecaca; }
.pc-btn-outline .material-icons { font-size: 18px; }

/* Empty Detail State */
.empty-detail {
  padding: 60px 40px; text-align: center;
  align-items: center; justify-content: center; height: 500px;
}
.floating-icon-wrap {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
.floating-icon { font-size: 40px; color: #94a3b8; }
.empty-detail h3 { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0 0 8px 0; }
.empty-detail p { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0; }

/* Modals */
.pc-modal-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: transparent;
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.pc-modal-content {
  width: 100%; max-width: 500px;
  padding: 0; overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255,255,255,0.4);
  animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from { transform: translateY(-40px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-header {
  padding: 24px; border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header .pc-icon-btn {
  transition: all 0.2s ease;
}
.modal-header .pc-icon-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
  transform: scale(1.1);
}
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-title-group h3 { margin: 0; font-size: 20px; font-weight: 800; color: #1e293b; }
.modal-body { padding: 24px; }
.modal-footer { padding: 20px 24px; background: rgba(248, 250, 252, 0.5); display: flex; justify-content: flex-end; border-top: 1px solid rgba(226, 232, 240, 0.6); }

.form-group label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 8px; }
.bg-green { background: linear-gradient(135deg, #10b981, #059669) !important; color: white !important;}

.chat-target { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #475569; }
.chat-badge { display: inline-flex; align-items: center; gap: 4px; background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 800; }
.chat-badge .material-icons { font-size: 14px; }

/* Responsive adjustments */
.mobile-close-btn {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.4);
  color: white; display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 10;
  transition: all 0.2s ease;
}

.mobile-close-btn:hover {
  background: rgba(239, 68, 68, 0.9);
  border-color: transparent;
  transform: scale(1.1);
}

@media (min-width: 1201px) {
  .mobile-close-btn { display: none; }
}

@media (max-width: 1200px) {
  .pc-main-grid { grid-template-columns: 1fr; }
  .pc-detail-sidebar { 
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    z-index: 100; background: transparent;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    pointer-events: none; /* Let clicks pass to background if empty */
  }
  .pc-detail-sidebar > * { pointer-events: auto; }
  .pc-detail-glass { width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
  .empty-detail { display: none !important; }
}

@media (max-width: 768px) {
  .pc-header { flex-direction: column; align-items: flex-start; }
  .pc-stats-grid { width: 100%; overflow-x: auto; padding-bottom: 10px; }
  .pc-stat-glass { flex-shrink: 0; min-width: 200px; }
  .pc-toolbar { flex-direction: column; align-items: stretch; }
  .pc-search-box { max-width: 100%; }
  .pc-filters { flex-direction: column; align-items: stretch; }
  .pc-tier-filters-wrapper { overflow-x: auto; }
  .pc-table th, .pc-table td { padding: 12px 10px; }
}
</style>
