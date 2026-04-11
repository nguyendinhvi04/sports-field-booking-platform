<template>
  <div class="page">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Đang tải danh sách người dùng...</p>
    </div>

    <div class="page-header">
      <div class="page-title">
        <Users :size="24" class="title-icon" />
        Quản lý Người dùng
        <span class="count">{{ filteredUsers.length }} tài khoản</span>
      </div>
      <div class="page-subtitle">Kiểm soát quyền truy cập và hoạt động của tất cả người dùng trên hệ thống</div>
    </div>

    <!-- Mini Stats -->
    <div class="stats-row">
      <div class="mini-stat">
        <div class="mini-icon blue"><UsersIcon :size="16" /></div>
        <div class="mini-info">
          <div class="mini-label">Người dùng (User)</div>
          <div class="mini-value">{{ counts.users }}</div>
        </div>
      </div>
      <div class="mini-stat">
        <div class="mini-icon purple"><Building2 :size="16" /></div>
        <div class="mini-info">
          <div class="mini-label">Chủ Câu lạc bộ (Owner)</div>
          <div class="mini-value">{{ counts.owners }}</div>
        </div>
      </div>
      <div class="mini-stat">
        <div class="mini-icon orange"><ShieldAlert :size="16" /></div>
        <div class="mini-info">
          <div class="mini-label">Bị khóa</div>
          <div class="mini-value">{{ counts.locked }}</div>
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
            <span v-if="t.count > 0" class="tab-badge">{{ t.count }}</span>
          </button>
        </div>
        
        <div class="search-input ml-auto">
          <Search :size="14" />
          <input type="text" v-model="searchQuery" placeholder="Tên, email hoặc ID..." />
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th>Hoạt động</th>
              <th>Trạng thái</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.id" :class="{ 'row-locked': !u.isActive }">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-sm">
                    <img v-if="u.avatarUrl" :src="u.avatarUrl" :alt="u.fullName" />
                    <span v-else>{{ u.fullName.charAt(0) }}</span>
                  </div>
                  <div class="user-meta" @click="handleViewDetail(u)">
                    <div class="user-fn clickable">{{ u.fullName }}</div>
                    <div class="user-em">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="role-badge" :class="u.role.toLowerCase()">
                   {{ u.role }}
                </div>
              </td>
              <td>{{ formatDate(u.createdAt) }}</td>
              <td>
                <div class="user-activity">
                   <div v-if="u.role === 'OWNER'" class="act-item" title="Số câu lạc bộ sở hữu">
                      <Home :size="12" /> {{ u._count?.ownedClubs || 0 }}
                   </div>
                   <div class="act-item" title="Số lượt đặt sân">
                      <CalendarCheck :size="12" /> {{ u._count?.bookings || 0 }}
                   </div>
                </div>
              </td>
              <td>
                <div class="status-badge" :class="u.isActive ? 'active' : 'locked'">
                  <div class="dot"></div>
                  {{ u.isActive ? 'Hoạt động' : 'Đã khóa' }}
                </div>
              </td>
              <td>
                <div class="row-actions justify-end">
                   <button class="row-btn" @click="handleViewDetail(u)"><Eye :size="14" /></button>
                   <button class="row-btn" :class="u.isActive ? 'warning-hover' : 'success-hover'" @click="handleToggleStatus(u)">
                      <component :is="u.isActive ? 'Lock' : 'Unlock'" :size="14" />
                   </button>
                   <button v-if="u.role !== 'ADMIN'" class="row-btn danger-hover" @click="handleDelete(u)"><Trash2 :size="14" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0 && !loading">
              <td colspan="6" class="empty-state">
                <div class="empty-ui">
                   <div class="empty-icon-wrapper"><SearchX :size="48" /></div>
                   <h3>Không tìm thấy người dùng</h3>
                   <p>Không có tài khoản nào khớp với điều kiện lọc của bạn.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content glass-modal wide" @click.stop>
        <div class="modal-header">
           <div class="header-with-icon">
             <div class="header-icon blue"><UsersIcon :size="18" /></div>
             <div>
               <h3>Hồ sơ người dùng</h3>
               <p class="modal-subtitle">Chi tiết tài khoản & Lịch sử hoạt động</p>
             </div>
           </div>
           <button class="close-btn" @click="showDetailModal = false"><X :size="20" /></button>
        </div>
        
        <div class="modal-body custom-scrollbar">
           <div class="profile-summary">
              <div class="u-profile-main">
                 <div class="u-avatar-lg">
                    <img v-if="selectedUser?.avatarUrl" :src="selectedUser.avatarUrl" />
                    <span v-else>{{ selectedUser?.fullName?.charAt(0) }}</span>
                 </div>
                 <div class="u-info-lg">
                    <h4>{{ selectedUser?.fullName }}</h4>
                    <div class="u-role-status">
                       <span class="role-badge" :class="selectedUser?.role?.toLowerCase()">{{ selectedUser?.role }}</span>
                       <span class="status-badge" :class="selectedUser?.isActive ? 'active' : 'locked'">
                          <div class="dot"></div> {{ selectedUser?.isActive ? 'Hoạt động' : 'Đã khóa' }}
                       </span>
                    </div>
                 </div>
              </div>
              
              <div class="u-stats-grid">
                 <div class="u-stat-card">
                    <div class="s-label">Lượt đặt sân</div>
                    <div class="s-value">{{ selectedUser?._count?.bookings || 0 }}</div>
                 </div>
                 <div v-if="selectedUser?.role === 'OWNER'" class="u-stat-card">
                    <div class="s-label">Câu lạc bộ sở hữu</div>
                    <div class="s-value">{{ selectedUser?._count?.ownedClubs || 0 }}</div>
                 </div>
                 <div class="u-stat-card">
                    <div class="s-label">Ngày tham gia</div>
                    <div class="s-value">{{ formatDate(selectedUser?.createdAt) }}</div>
                 </div>
              </div>
           </div>

           <div class="detail-sections mt-6">
              <div class="info-group">
                 <div class="group-label">Thông tin liên hệ</div>
                 <div class="info-details-box">
                    <div class="d-item">
                       <span class="d-label">Email:</span>
                       <span class="d-val">{{ selectedUser?.email }}</span>
                    </div>
                    <div class="d-item">
                       <span class="d-label">Số điện thoại:</span>
                       <span class="d-val">{{ selectedUser?.phone || 'Chưa cập nhật' }}</span>
                    </div>
                    <div class="d-item">
                       <span class="d-label">ID Người dùng:</span>
                       <span class="d-val font-mono">{{ selectedUser?.id }}</span>
                    </div>
                 </div>
              </div>

              <div v-if="selectedUser?.role === 'USER'" class="info-group mt-6">
                 <div class="group-label">Hạng thành viên</div>
                 <div class="tier-card">
                    <div class="tier-icon"><ShieldCheck :size="24" /></div>
                    <div class="tier-info">
                       <div class="tier-name">Thành viên Bạc (Silver)</div>
                       <div class="tier-desc">Sắp đạt hạng Vàng (Cần thêm 3 lượt đặt sân)</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div class="modal-footer">
           <button class="footer-btn ghost" @click="showDetailModal = false">Thoát</button>
           <button class="footer-btn danger" v-if="selectedUser?.isActive" @click="handleToggleStatus(selectedUser)">Khóa tài khoản</button>
           <button class="footer-btn success" v-else @click="handleToggleStatus(selectedUser)">Mở khóa tài khoản</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { 
  Users, Search, Eye, Lock, Unlock, Trash2, Home, 
  CalendarCheck, Building2, ShieldAlert, SearchX,
  Users as UsersIcon, LayoutGrid, ShieldCheck, X
} from 'lucide-vue-next';
import { adminService } from '@/services/admin.service';

export default {
  name: 'UsersManagementView',
  components: {
    Users, Search, Eye, Lock, Unlock, Trash2, Home, 
    CalendarCheck, Building2, ShieldAlert, SearchX, UsersIcon, LayoutGrid, ShieldCheck, X
  },
  setup() {
    const users = ref([]);
    const loading = ref(false);
    const searchQuery = ref('');
    const activeTab = ref('all');

    const tabs = computed(() => [
      { id: 'all', label: 'Tất cả', icon: 'LayoutGrid', count: users.value.length },
      { id: 'USER', label: 'Khách hàng', icon: 'UsersIcon', count: users.value.filter(u => u.role === 'USER').length },
      { id: 'OWNER', label: 'Chủ Câu lạc bộ', icon: 'Building2', count: users.value.filter(u => u.role === 'OWNER').length },
      { id: 'ADMIN', label: 'Quản trị', icon: 'ShieldCheck', count: users.value.filter(u => u.role === 'ADMIN').length },
    ]);

    const showDetailModal = ref(false);
    const selectedUser = ref(null);

    const fetchUsers = async () => {
      loading.value = true;
      try {
        const response = await adminService.getUsers();
        users.value = response.data.data;
      } catch (error) {
        console.error("Lỗi khi tải người dùng:", error);
      } finally {
        loading.value = false;
      }
    };

    const handleToggleStatus = async (user) => {
      const nextStatus = !user.isActive;
      const actionText = nextStatus ? 'mở khóa' : 'khóa';
      if (!confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) return;

      try {
        await adminService.updateUserStatus(user.id, nextStatus);
        user.isActive = nextStatus;
      } catch (error) {
        alert("Thao tác thất bại!");
      }
    };

    const handleDelete = async (user) => {
       alert("Tính năng xóa đang được bảo trì. Vui lòng sử dụng tính năng 'Khóa tài khoản' để đình chỉ người dùng này.");
    };

    const handleViewDetail = (user) => {
       selectedUser.value = user;
       showDetailModal.value = true;
    };

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const counts = computed(() => ({
      users: users.value.filter(u => u.role === 'USER').length,
      owners: users.value.filter(u => u.role === 'OWNER').length,
      locked: users.value.filter(u => !u.isActive).length,
    }));

    const filteredUsers = computed(() => {
      let filtered = users.value;
      
      if (activeTab.value !== 'all') {
        filtered = filtered.filter(u => u.role === activeTab.value);
      }
      
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        filtered = filtered.filter(u => 
          u.fullName.toLowerCase().includes(q) || 
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
        );
      }
      
      return filtered;
    });

    onMounted(fetchUsers);

    return {
      users,
      loading,
      searchQuery,
      activeTab,
      tabs,
      filteredUsers,
      counts,
      handleToggleStatus,
      handleDelete,
      handleViewDetail,
      formatDate,
      showDetailModal,
      selectedUser
    };
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.title-icon { color: var(--accent); }

.loading-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(var(--bg-rgb), 0.7);
  backdrop-filter: blur(4px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 50; border-radius: var(--radius-lg);
}
.spinner { width: 30px; height: 30px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.mini-stat { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; display: flex; align-items: center; gap: 16px; }
.mini-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.mini-icon.blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
.mini-icon.purple { background: rgba(168,85,247,0.1); color: #a855f7; }
.mini-icon.orange { background: var(--orange-soft); color: var(--orange); }
.mini-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.mini-value { font-size: 24px; font-weight: 800; color: var(--text-primary); line-height: 1; }

/* Tabs */
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

.tab-badge { 
  font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px; 
  line-height: 1; display: flex; align-items: center; justify-content: center;
  background: var(--accent); color: white; box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.4);
}

.table-toolbar { padding: 14px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--border); }
.search-input { display: flex; align-items: center; gap: 10px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; padding: 0 14px; height: 38px; width: 320px; transition: all 0.2s; }
.search-input input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 14px; width: 100%; }

/* Modal CSS */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes modalIn { from { opacity: 0; } to { opacity: 1; } }

.glass-modal { background: rgba(var(--bg-rgb), 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); backdrop-filter: blur(20px); overflow: hidden; display: flex; flex-direction: column; }
.glass-modal.wide { width: 100%; max-width: 600px; max-height: 90vh; }

.modal-header { padding: 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
.header-with-icon { display: flex; align-items: center; gap: 15px; }
.header-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(59,130,246,0.1); color: #3b82f6; }
.modal-header h3 { font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0; }
.modal-subtitle { font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0; }

.close-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.close-btn:hover { background: rgba(255,255,255,0.05); color: var(--red); }

.modal-body { padding: 24px; overflow-y: auto; }
.profile-summary { display: flex; flex-direction: column; gap: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.u-profile-main { display: flex; align-items: center; gap: 20px; }
.u-avatar-lg { width: 80px; height: 80px; border-radius: 24px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: var(--accent); border: 2px solid rgba(255,255,255,0.1); }
.u-avatar-lg img { width: 100%; height: 100%; object-fit: cover; border-radius: 22px; }
.u-info-lg h4 { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0; }
.u-role-status { display: flex; align-items: center; gap: 10px; }

.u-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.u-stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px; }
.s-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 4px; }
.s-value { font-size: 18px; font-weight: 800; color: var(--text-primary); }

.group-label { font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
.info-details-box { background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.d-item { display: flex; gap: 12px; font-size: 14px; }
.d-label { color: var(--text-muted); width: 110px; }
.d-val { color: var(--text-primary); font-weight: 600; }
.font-mono { font-family: monospace; }

.tier-card { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.15), rgba(var(--bg-rgb), 0.05)); border: 1px solid rgba(var(--accent-rgb), 0.2); border-radius: 14px; padding: 16px; }
.tier-icon { color: var(--accent); }
.tier-name { font-size: 15px; font-weight: 800; color: var(--text-primary); }
.tier-desc { font-size: 12px; color: var(--text-secondary); }

.modal-footer { padding: 20px; display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.05); }
.footer-btn { padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.footer-btn.ghost { background: transparent; color: var(--text-muted); border-color: rgba(255,255,255,0.1); }
.footer-btn.ghost:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
.footer-btn.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
.footer-btn.danger:hover { background: #ef4444; color: white; }
.footer-btn.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: rgba(34, 197, 94, 0.2); }
.footer-btn.success:hover { background: #22c55e; color: white; }

.clickable { cursor: pointer; transition: color 0.2s; }
.clickable:hover { color: var(--accent); }

/* User Cell */
.user-fn.clickable:hover { text-decoration: underline; }

/* User Cell */
.user-cell { display: flex; align-items: center; gap: 12px; }
.user-avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-tertiary); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--accent); overflow: hidden; }
.user-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
.user-fn { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.user-em { font-size: 12px; color: var(--text-muted); }

/* Badges */
.role-badge { display: inline-flex; height: 22px; padding: 0 10px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; align-items: center; justify-content: center; }
.role-badge.user { color: #3b82f6; background: rgba(59,130,246,0.1); }
.role-badge.owner { color: #8b5cf6; background: rgba(139,92,246,0.1); }
.role-badge.admin { color: #f59e0b; background: rgba(245,158,11,0.1); }

.status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.status-badge.active { color: var(--green); }
.status-badge.active .dot { background: var(--green); box-shadow: 0 0 8px var(--green); }
.status-badge.locked { color: var(--text-muted); }
.status-badge.locked .dot { background: var(--red); }

/* Activity */
.user-activity { display: flex; gap: 12px; }
.act-item { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--text-secondary); background: var(--bg-tertiary); padding: 4px 8px; border-radius: 6px; }
.act-item svg { color: var(--accent); opacity: 0.7; }

/* Row Actions */
.row-locked { opacity: 0.7; filter: grayscale(0.5); }
.row-actions { display: flex; gap: 6px; }
.row-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.row-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--bg-hover); }
.row-btn.success-hover:hover { background: var(--green); color: white; border-color: var(--green); }
.row-btn.warning-hover:hover { background: var(--orange); color: white; border-color: var(--orange); }
.row-btn.danger-hover:hover { background: var(--red); color: white; border-color: var(--red); }

/* Empty state */
.empty-ui { padding: 80px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.empty-icon-wrapper { width: 80px; height: 80px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 20px; border: 2px dashed var(--border); }

/* Helpers */
.text-right { text-align: right; }
.justify-end { justify-content: flex-end; }
.ml-auto { margin-left: auto; }
.mt-6 { margin-top: 24px; }
</style>
