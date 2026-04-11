<template>
  <div class="page custom-scrollbar">
    <div class="page-header">
      <div class="page-title">
        <Building2Icon :size="24" class="title-icon" />
        Hồ sơ Chủ Câu lạc bộ
        <span class="count">{{ owners.length }} đối tác</span>
      </div>
      <div class="page-subtitle">Quản lý thông tin kinh doanh, thống kê hoạt động và cơ sở hạ tầng của các chủ Câu lạc bộ</div>
    </div>

    <!-- Stat Cards Summary -->
    <div class="owner-stats-grid">
      <div class="stat-mini-card">
        <div class="stat-icon-bg blue"><UsersIcon :size="18" /></div>
        <div class="stat-info">
          <div class="stat-label">Tổng số chủ sở hữu</div>
          <div class="stat-value">{{ owners.length }}</div>
        </div>
      </div>
      <div class="stat-mini-card">
        <div class="stat-icon-bg green"><Home :size="18" /></div>
        <div class="stat-info">
          <div class="stat-label">Tổng số Câu lạc bộ</div>
          <div class="stat-value">{{ totalClubs }}</div>
        </div>
      </div>
      <div class="stat-mini-card">
        <div class="stat-icon-bg orange"><ShieldCheck :size="18" /></div>
        <div class="stat-info">
          <div class="stat-label">Đã xác minh (KYC)</div>
          <div class="stat-value">{{ verifiedCount }}</div>
        </div>
      </div>
    </div>

    <div class="table-card mt-6">
      <div class="table-toolbar">
        <div class="tabs">
          <button 
            v-for="t in tabs" 
            :key="t.id" 
            class="tab-btn" 
            :class="{active: activeTab === t.id}"
            @click="activeTab = t.id"
          >
            <component :is="t.icon" :size="14" class="tab-icon" />
            {{ t.label }}
          </button>
        </div>
        <div class="search-input ml-auto">
          <Search :size="14" />
          <input type="text" v-model="searchQuery" placeholder="Tìm theo tên, email, SĐT..." />
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Thông tin Chủ sở hữu</th>
              <th>Số điện thoại</th>
              <th>Cơ sở (CLB)</th>
              <th>Trạng thái KYC</th>
              <th>Ngày tham gia</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in filteredOwners" :key="o.id" @click="viewOwnerDetail(o)">
              <td>
                <div class="owner-cell">
                  <div class="owner-avatar" :style="{ background: getRandomGradient(o.id) }">
                    {{ o.user?.fullName?.charAt(0) || 'O' }}
                  </div>
                  <div class="owner-meta">
                    <div class="owner-name">{{ o.user?.fullName }}</div>
                    <div class="owner-email">{{ o.user?.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ o.user?.phone || '---' }}</td>
              <td>
                <div class="clubs-count">
                   <div class="count-pill">{{ o.clubs?.length || 0 }} CLB</div>
                </div>
              </td>
              <td>
                <div class="status-badge" :class="o.kycStatus.toLowerCase()">
                  <div class="dot"></div>
                  {{ statusLabels[o.kycStatus] || 'Chờ duyệt' }}
                </div>
              </td>
              <td>{{ formatDate(o.createdAt) }}</td>
              <td>
                <div class="row-actions justify-end">
                   <button class="row-btn" title="Xem chi tiết">
                     <Eye :size="14" />
                   </button>
                   <button class="row-btn ghost" title="Liên hệ">
                     <MessageSquare :size="14" />
                   </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredOwners.length === 0 && !loading">
               <td colspan="6" class="empty-state">
                 <SearchX :size="40" />
                 <p>Không tìm thấy chủ Câu lạc bộ nào</p>
               </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Owner Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content glass-modal wide" @click.stop>
        <div class="modal-header">
           <div class="header-with-icon">
             <div class="header-icon"><Building2Icon :size="18" /></div>
             <div>
               <h3>Hồ sơ kinh doanh</h3>
               <p class="modal-subtitle">Chi tiết hoạt động của {{ selectedOwner?.user?.fullName }}</p>
             </div>
           </div>
           <button class="close-btn" @click="showDetailModal = false"><X :size="20" /></button>
        </div>
        
        <div class="modal-body custom-scrollbar">
           <div class="owner-profile-card">
              <div class="profile-header">
                 <div class="profile-avatar">{{ selectedOwner?.user?.fullName?.charAt(0) }}</div>
                 <div class="profile-main">
                    <h4>{{ selectedOwner?.user?.fullName }}</h4>
                    <p>{{ selectedOwner?.user?.email }} • {{ selectedOwner?.user?.phone }}</p>
                 </div>
                 <div class="kyc-indicator" :class="selectedOwner?.kycStatus.toLowerCase()">
                    {{ statusLabels[selectedOwner?.kycStatus] }}
                 </div>
              </div>
              
              <div class="profile-stats">
                 <div class="p-stat">
                    <span class="p-label">Tổng Câu lạc bộ</span>
                    <span class="p-val">{{ selectedOwner?.clubs?.length || 0 }}</span>
                 </div>
                 <div class="p-stat">
                    <span class="p-label">Ngày hợp tác</span>
                    <span class="p-val">{{ formatDate(selectedOwner?.createdAt) }}</span>
                 </div>
                 <div class="p-stat">
                    <span class="p-label">ID Đối tác</span>
                    <span class="p-val font-mono">{{ selectedOwner?.id }}</span>
                 </div>
              </div>
           </div>

           <div class="clubs-section mt-6">
              <div class="section-label">Danh sách Câu lạc bộ sở hữu</div>
              <div class="clubs-grid" v-if="selectedOwner?.clubs?.length > 0">
                 <div v-for="c in selectedOwner.clubs" :key="c.id" class="club-mini-card">
                    <div class="club-img">
                       <img v-if="c.images?.[0]" :src="c.images[0]" />
                       <div v-else class="img-placeholder"><Home :size="20" /></div>
                    </div>
                    <div class="club-info">
                       <div class="club-name">{{ c.name }}</div>
                       <div class="club-address">{{ c.address }}</div>
                       <div class="club-status-pill" :class="c.approvalStatus.toLowerCase()">{{ c.approvalStatus }}</div>
                    </div>
                 </div>
              </div>
              <div v-else class="empty-mini-state">
                 Chưa có câu lạc bộ nào được đăng ký
              </div>
           </div>
        </div>

        <div class="modal-footer">
           <button class="footer-btn ghost" @click="showDetailModal = false">Thoát</button>
           <button class="footer-btn primary">
              <Mail :size="16" /> Gửi thông báo
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { 
  Building2 as Building2Icon, Search, Eye, MessageSquare, 
  X, Mail, Users as UsersIcon, Home, ShieldCheck, 
  SearchX, LayoutGrid, Clock, ShieldAlert
} from 'lucide-vue-next';
import { adminService } from '@/services/admin.service';

export default {
  name: 'ClubOwnersView',
  components: {
    Building2Icon, Search, Eye, MessageSquare, 
    X, Mail, UsersIcon, Home, ShieldCheck, 
    SearchX, LayoutGrid, Clock, ShieldAlert
  },
  setup() {
    const owners = ref([]);
    const loading = ref(false);
    const searchQuery = ref('');
    const activeTab = ref('all');
    const showDetailModal = ref(false);
    const selectedOwner = ref(null);

    const tabs = [
      { id: 'all', label: 'Tất cả chủ CLB', icon: 'LayoutGrid' },
      { id: 'verified', label: 'Đã xác minh', icon: 'ShieldCheck' },
      { id: 'pending', label: 'Đang xác minh', icon: 'Clock' },
      { id: 'locked', label: 'Bị khóa', icon: 'ShieldAlert' },
    ];

    const statusLabels = {
      PENDING: 'Đang xác minh',
      APPROVED: 'Đã xác minh',
      REJECTED: 'Bị từ chối'
    };

    const fetchOwners = async () => {
      loading.value = true;
      try {
        const response = await adminService.getAllOwners();
        owners.value = response.data.data;
      } catch (error) {
        console.error("Lỗi khi tải danh sách chủ câu lạc bộ:", error);
      } finally {
        loading.value = false;
      }
    };

    const totalClubs = computed(() => owners.value.reduce((acc, curr) => acc + (curr.clubs?.length || 0), 0));
    const verifiedCount = computed(() => owners.value.filter(o => o.kycStatus === 'APPROVED').length);

    const filteredOwners = computed(() => {
      let result = owners.value;
      if (activeTab.value === 'verified') result = result.filter(o => o.kycStatus === 'APPROVED');
      if (activeTab.value === 'pending') result = result.filter(o => o.kycStatus === 'PENDING');
      if (activeTab.value === 'locked') result = result.filter(o => o.user?.isActive === false);

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(o => 
          o.user?.fullName?.toLowerCase().includes(q) || 
          o.user?.email?.toLowerCase().includes(q) || 
          o.user?.phone?.includes(q)
        );
      }
      return result;
    });

    const viewOwnerDetail = (owner) => {
      selectedOwner.value = owner;
      showDetailModal.value = true;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '---';
      return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const getRandomGradient = (id) => {
       const colors = [
          'linear-gradient(135deg, #4f6ef7, #9b51e0)',
          'linear-gradient(135deg, #22c55e, #10b981)',
          'linear-gradient(135deg, #f59e0b, #d97706)',
          'linear-gradient(135deg, #ef4444, #b91c1c)'
       ];
       const index = id.charCodeAt(id.length - 1) % colors.length;
       return colors[index];
    };

    onMounted(fetchOwners);

    return {
      owners, loading, searchQuery, activeTab, tabs, 
      totalClubs, verifiedCount, filteredOwners, 
      showDetailModal, selectedOwner, statusLabels,
      viewOwnerDetail, formatDate, getRandomGradient
    };
  }
}
</script>

<style scoped>
/* Page & Stats Grid */
.owner-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }

.stat-mini-card { 
  background: var(--bg-secondary); border: 1px solid var(--border); 
  border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 16px; 
}

.stat-icon-bg { 
  width: 42px; height: 42px; border-radius: 10px; 
  display: flex; align-items: center; justify-content: center; 
}
.stat-icon-bg.blue { background: rgba(79,110,247,0.1); color: #4f6ef7; }
.stat-icon-bg.green { background: rgba(34,197,94,0.1); color: #22c55e; }
.stat-icon-bg.orange { background: rgba(245,158,11,0.1); color: #f59e0b; }

.stat-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 18px; font-weight: 800; color: var(--text-primary); margin-top: 2px; }

/* Premium Tabs */
.tabs { display: flex; gap: 4px; background: var(--bg-tertiary); padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
.tab-btn { 
  padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 700; 
  color: var(--text-secondary); border: none; background: transparent; 
  cursor: pointer; display: flex; align-items: center; gap: 10px; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }
.tab-btn.active { background: var(--bg-secondary); color: var(--accent); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.tab-icon { opacity: 0.7; }
.tab-btn.active .tab-icon { opacity: 1; }

.table-toolbar { padding: 14px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--border); }

/* Search Input */
.search-input { 
  display: flex; align-items: center; gap: 10px; background: var(--bg-tertiary); 
  border: 1px solid var(--border); border-radius: 8px; padding: 0 14px; 
  height: 38px; width: 320px; transition: all 0.2s; 
}
.search-input:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,110,247,0.15); }
.search-input input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 14px; width: 100%; }

/* Table Specifics */
.owner-cell { display: flex; align-items: center; gap: 12px; }
.owner-avatar { 
  width: 36px; height: 36px; border-radius: 50%; color: white; 
  font-weight: 800; display: flex; align-items: center; justify-content: center; 
  font-size: 14px; 
}
.owner-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.owner-email { font-size: 11px; color: var(--text-muted); }

.count-pill { background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }

.status-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; background: rgba(255,255,255,0.05); }
.status-badge.approved { color: var(--green); background: rgba(34,197,94,0.1); }
.status-badge.pending { color: var(--orange); background: rgba(245,158,11,0.1); }
.status-badge.rejected { color: var(--red); background: rgba(239,68,68,0.1); }
.status-badge .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

/* Modal Customization */
.wide { width: 800px; }
.owner-profile-card { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
.profile-header { display: flex; align-items: center; gap: 20px; }
.profile-avatar { width: 64px; height: 64px; background: var(--accent); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: white; }
.profile-main h4 { font-size: 18px; font-weight: 800; margin: 0; }
.profile-main p { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.kyc-indicator { margin-left: auto; padding: 6px 16px; border-radius: 30px; font-size: 12px; font-weight: 700; }
.kyc-indicator.approved { background: var(--green); color: white; }
.kyc-indicator.pending { background: var(--orange); color: white; }
.kyc-indicator.rejected { background: var(--red); color: white; }

.profile-stats { display: flex; gap: 32px; margin-top: 24px; padding-top: 20px; border-top: 1px dashed var(--border); }
.p-stat { display: flex; flex-direction: column; gap: 4px; }
.p-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.p-val { font-size: 14px; font-weight: 700; color: var(--text-primary); }

.clubs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.club-mini-card { background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; gap: 12px; }
.club-img { width: 50px; height: 50px; border-radius: 8px; overflow: hidden; background: #333; }
.club-img img { width: 100%; height: 100%; object-fit: cover; }
.club-info { flex: 1; }
.club-name { font-size: 13px; font-weight: 700; }
.club-address { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.club-status-pill { display: inline-block; font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; margin-top: 6px; background: rgba(255,255,255,0.1); }

.empty-mini-state { padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px; font-style: italic; }

.page { padding-bottom: 40px; }
.mt-6 { margin-top: 24px; }
.ml-auto { margin-left: auto; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
</style>
