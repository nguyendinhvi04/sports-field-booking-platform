<template>
  <div class="page">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <div class="page-header">
      <div class="page-title">
        <Home :size="24" class="title-icon" />
        Quản lý Câu lạc bộ & Sân
        <span class="count">{{ counts.total }} mục</span>
      </div>
      <div class="page-subtitle">Phê duyệt cơ sở mới và kiểm soát trạng thái vận hành của từng sân đấu</div>
    </div>

    <!-- Stats summary -->
    <div class="stats-row">
      <div class="mini-stat" @click="handleTabChange('PENDING')" :class="{ active: activeTab === 'PENDING' }">
        <div class="mini-icon orange"><Clock :size="16" /></div>
        <div class="mini-info">
          <div class="mini-label">Yêu cầu mới</div>
          <div class="mini-value">{{ counts.pending }}</div>
        </div>
      </div>
      <div class="mini-stat" @click="handleTabChange('APPROVED')" :class="{ active: activeTab === 'APPROVED' }">
        <div class="mini-icon green"><CheckCircle :size="16" /></div>
        <div class="mini-info">
          <div class="mini-label">Hợp lệ</div>
          <div class="mini-value">{{ counts.active }}</div>
        </div>
      </div>
      <div class="mini-stat" @click="handleTabChange('LOCKED')" :class="{ active: activeTab === 'LOCKED' }">
        <div class="mini-icon red"><Lock :size="16" /></div>
        <div class="mini-info">
          <div class="mini-label">Đã đình chỉ</div>
          <div class="mini-value">{{ counts.locked }}</div>
        </div>
      </div>
    </div>

    <!-- Contextual Info Banner -->
    <div v-if="activeTab === 'PENDING' && counts.pending > 0" class="context-banner pending-banner">
      <div class="banner-icon"><AlertCircle :size="20" /></div>
      <div class="banner-text">
        <strong>Yêu cầu phê duyệt mới:</strong> Đang có {{ counts.pending }} câu lạc bộ chờ bạn xác nhận thông tin cơ sở vật chất.
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
            @click="handleTabChange(t.id)"
          >
            <component :is="t.icon" :size="14" class="tab-icon" />
            {{ t.label }}
            <span v-if="t.count > 0" class="tab-badge" :class="t.id.toLowerCase()">{{ t.count }}</span>
          </button>
        </div>
        
        <div class="search-input ml-auto">
          <Search :size="14" />
          <input type="text" v-model="searchQuery" placeholder="Tìm tên CLB, chủ sở hữu..." />
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th width="40"></th>
              <th>Câu lạc bộ</th>
              <th>Cơ sở vật chất</th>
              <th>Chủ sở hữu</th>
              <th>Ngày yêu cầu</th>
              <th>Duyệt</th>
              <th>Vận hành</th>
              <th class="text-right">Hành động</th>
            </tr>
          </thead>
          <template v-for="c in filteredCourts" :key="c.id">
            <tbody class="club-row-group">
              <tr :class="{ 'row-pending': c.approvalStatus === 'PENDING', 'row-locked': !c.isActive }">
                <td class="text-center">
                  <button v-if="c.courts?.length > 0" class="expand-btn" @click="toggleRow(c.id)">
                    <ChevronDown v-if="expandedRows.includes(c.id)" :size="16" />
                    <ChevronRight v-else :size="16" />
                  </button>
                </td>
                <td>
                  <div class="court-info-cell clickable" @click="openClubModal(c)">
                    <div class="court-img">
                      <img v-if="c.images?.[0]" :src="c.images[0].url" alt="club" class="object-cover w-full h-full" />
                      <Building2 v-else :size="16" />
                    </div>
                    <div>
                      <div class="court-name link-hover">{{ c.name }}</div>
                      <div class="court-sub">ID: {{ c.id.slice(-8).toUpperCase() }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="facility-preview">
                    <div class="font-bold">{{ c.courts?.length || 0 }} sân</div>
                  </div>
                </td>
                <td>
                  <div class="owner-cell">
                    <span class="owner-name">{{ c.owner?.fullName || '---' }}</span>
                    <span class="phone">{{ c.owner?.phone || '---' }}</span>
                  </div>
                </td>
                <td>{{ formatDate(c.createdAt) }}</td>
                <td>
                  <div class="approval-badge" :class="c.approvalStatus.toLowerCase()">
                    {{ c.approvalStatus === 'APPROVED' ? 'Hợp lệ' : (c.approvalStatus === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt') }}
                  </div>
                </td>
                <td>
                  <div class="status-badge" :class="c.isActive ? 'active' : 'locked'">
                    <div class="dot"></div>
                    {{ c.isActive ? 'Mở cửa' : 'Khóa CLB' }}
                  </div>
                </td>
                <td>
                  <div class="row-actions justify-end">
                    <template v-if="c.approvalStatus === 'PENDING'">
                      <button class="row-btn success glow" @click="handleApproval(c, 'APPROVED')"><Check :size="14" /></button>
                      <button class="row-btn danger-hover" @click="handleApproval(c, 'REJECTED')"><X :size="14" /></button>
                    </template>
                    <template v-else-if="c.approvalStatus === 'APPROVED'">
                      <button class="row-btn" :class="c.isActive ? 'warning-hover' : 'success-hover'" @click="handleToggleStatus(c)">
                        <component :is="c.isActive ? 'Lock' : 'Unlock'" :size="14" />
                      </button>
                    </template>
                    <button class="row-btn" @click="handleViewClub(c)"><Eye :size="14" /></button>
                  </div>
                </td>
              </tr>
              <!-- Expanded Court List -->
              <tr v-if="expandedRows.includes(c.id)" class="expanded-row">
                <td colspan="8" class="p-0">
                  <div class="court-detail-list">
                    <div class="detail-header">Danh sách sân chi tiết của {{ c.name }}</div>
                    <div class="court-grid">
                      <div v-for="court in c.courts" :key="court.id" class="court-mini-card" :class="{ suspended: court.status === 'SUSPENDED' }" @click="openCourtModal(court)">
                        <div class="court-mini-info">
                          <div class="court-mini-name">{{ court.name }}</div>
                          <div class="court-mini-tag">{{ court.sportType }}</div>
                        </div>
                        <div class="court-mini-actions">
                          <div class="status-indicator" :class="court.status.toLowerCase()">
                            {{ court.status === 'ACTIVE' ? 'Hoạt động' : 'Đình chỉ' }}
                          </div>
                          <button class="mini-action-btn" :title="court.status === 'ACTIVE' ? 'Khóa sân này' : 'Mở lại sân này'" @click.stop="handleToggleCourt(court)">
                             <component :is="court.status === 'ACTIVE' ? 'Lock' : 'Unlock'" :size="12" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
          <tbody v-if="filteredCourts.length === 0 && !loading">
            <tr>
              <td colspan="8" class="empty-state">
                <div class="empty-ui">
                   <div class="empty-icon-wrapper"><SearchX :size="48" /></div>
                   <h3>Không tìm thấy dữ liệu</h3>
                   <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    <!-- Court Detail Modal -->
    <div v-if="selectedCourt" class="modal-overlay" @click="selectedCourt = null">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <div class="modal-title-group">
            <h3>{{ selectedCourt.name }}</h3>
            <span class="status-tag" :class="selectedCourt.status.toLowerCase()">{{ selectedCourt.status }}</span>
          </div>
          <button class="close-modal" @click="selectedCourt = null"><X :size="20" /></button>
        </div>
        
        <div class="modal-body custom-scrollbar">
          <div class="court-hero mb-6">
            <div class="court-gallery">
              <div v-if="selectedCourt.images?.length > 0" class="main-img">
                <img :src="selectedCourt.images[0].url" alt="court" />
              </div>
              <div v-else class="empty-img-placeholder">
                <Activity :size="48" />
                <p>Chưa có hình hiệu sân</p>
              </div>
            </div>
            <div class="info-grid flex-1">
              <div class="info-item">
                <div class="info-label">Loại thể thao</div>
                <div class="info-value">{{ selectedCourt.sportType }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Sức chứa</div>
                <div class="info-value">{{ selectedCourt.capacity || '---' }} người</div>
              </div>
              <div class="info-item">
                <div class="info-label">Bề mặt sân</div>
                <div class="info-value">{{ selectedCourt.surface || '---' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Ngày tạo</div>
                <div class="info-value">{{ formatDate(selectedCourt.createdAt) }}</div>
              </div>
            </div>
          </div>

          <div class="pricing-section mt-6">
            <div class="section-title">Bảng giá niêm yết</div>
            <div v-if="selectedCourt.pricings?.length > 0" class="pricing-list">
              <div v-for="price in selectedCourt.pricings" :key="price.id" class="pricing-item">
                <div class="price-time">
                  <Clock :size="14" /> {{ formatTime(price.startTime) }} - {{ formatTime(price.endTime) }}
                </div>
                <div class="price-days">
                  <template v-if="price.dayOfWeek === null">Tất cả các ngày</template>
                  <template v-else>Thứ {{ price.dayOfWeek + 1 }}</template>
                </div>
                <div class="price-value">{{ formatCurrency(price.pricePerHour) }}<small>/h</small></div>
              </div>
            </div>
            <div v-else class="empty-pricing">Chưa có bảng giá được thiết lập cho sân này.</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn secondary" @click="selectedCourt = null">Đóng</button>
          <button class="modal-btn" :class="selectedCourt.status === 'ACTIVE' ? 'danger' : 'success'" @click="handleToggleCourt(selectedCourt)">
            {{ selectedCourt.status === 'ACTIVE' ? 'Đình chỉ hoạt động' : 'Kích hoạt lại' }}
          </button>
        </div>
      </div>
    </div>
    </div>

    <!-- Club Detail Modal -->
    <div v-if="selectedClub" class="modal-overlay" @click="selectedClub = null">
      <div class="modal-card wide" @click.stop>
        <div class="modal-header">
          <div class="modal-title-group">
            <h3>Hồ sơ Câu lạc bộ</h3>
            <span class="status-badge" :class="selectedClub.isActive ? 'active' : 'locked'">{{ selectedClub.isActive ? 'Đang mở' : 'Đã khóa' }}</span>
          </div>
          <button class="close-modal" @click="selectedClub = null"><X :size="20" /></button>
        </div>

        <div class="modal-body custom-scrollbar">
          <div class="club-hero">
            <div class="club-gallery">
              <div v-if="selectedClub.images?.length > 0" class="main-img">
                <img :src="selectedClub.images[0].url" alt="club" />
              </div>
              <div v-else class="empty-img-placeholder">
                <Building2 :size="48" />
                <p>Chưa có hình ảnh</p>
              </div>
            </div>
            <div class="club-essential">
              <h2 class="club-display-name">{{ selectedClub.name }}</h2>
              <div class="club-meta-item">
                <MapPin :size="16" />
                <span>{{ selectedClub.address || 'Chưa cập nhật địa chỉ' }}</span>
              </div>
              <div class="club-meta-item">
                <Clock :size="16" />
                <span>Ngày tham gia: {{ formatDate(selectedClub.createdAt) }}</span>
              </div>
              <div class="approval-status-box" :class="selectedClub.approvalStatus.toLowerCase()">
                 {{ selectedClub.approvalStatus === 'APPROVED' ? 'Hợp lệ' : (selectedClub.approvalStatus === 'PENDING' ? 'Đang chờ duyệt' : 'Đã từ chối') }}
              </div>
            </div>
          </div>

          <div class="modal-grid-2 mt-6">
            <div class="detail-section">
              <div class="section-title"><FileText :size="14" /> Giới thiệu</div>
              <p class="club-desc">{{ selectedClub.description || 'Câu lạc bộ chưa cung cấp mô tả chi tiết.' }}</p>
            </div>
            <div class="detail-section">
              <div class="section-title"><Users :size="14" /> Thông tin chủ sở hữu</div>
              <div class="owner-profile-card">
                <div class="owner-avatar-mini">{{ selectedClub.owner?.fullName?.charAt(0) }}</div>
                <div class="owner-details">
                  <div class="owner-fn">{{ selectedClub.owner?.fullName || '---' }}</div>
                  <div class="owner-ph">{{ selectedClub.owner?.phone || '---' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="facility-summary mt-6">
             <div class="section-title"><Activity :size="14" /> Danh sách sân đấu ({{ selectedClub.courts?.length || 0 }})</div>
             <div class="mini-court-list">
                <div v-for="ct in selectedClub.courts" :key="ct.id" class="m-court-item">
                   <span class="m-court-name">{{ ct.name }}</span>
                   <span class="m-court-type">{{ ct.sportType }}</span>
                   <div class="dot-status" :class="ct.status.toLowerCase()"></div>
                </div>
             </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn secondary" @click="selectedClub = null">Đóng hồ sơ</button>
          
          <template v-if="selectedClub.approvalStatus === 'PENDING'">
            <button class="modal-btn danger" @click="handleApproval(selectedClub, 'REJECTED')">Từ chối</button>
            <button class="modal-btn success" @click="handleApproval(selectedClub, 'APPROVED')">Phê duyệt ngay</button>
          </template>
          
          <button v-else class="modal-btn" :class="selectedClub.isActive ? 'warning' : 'success'" @click="handleToggleStatus(selectedClub)">
            {{ selectedClub.isActive ? 'Tạm đình chỉ CLB' : 'Kích hoạt lại CLB' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Search, Plus, Pencil, Lock, Unlock, Eye, 
  Activity, Check, X, Clock, Building2, 
  CheckCircle, SearchX, AlertCircle, ShieldAlert,
  Home, ChevronDown, ChevronRight, MapPin, FileText, Users, LayoutGrid
} from 'lucide-vue-next';
import { adminService } from '@/services/admin.service';

export default {
  name: 'CourtsManagementView',
  components: {
    Search, Plus, Pencil, Lock, Unlock, Eye, 
    Activity, Check, X, Clock, Building2, 
    CheckCircle, SearchX, AlertCircle, ShieldAlert,
    Home, ChevronDown, ChevronRight, MapPin, FileText, Users, LayoutGrid
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const activeTab = ref('all');
    const searchQuery = ref('');
    const clubs = ref([]);
    const loading = ref(false);
    const expandedRows = ref([]); // Quản lý các dòng đang mở rộng
    const selectedCourt = ref(null); // Sân đang được chọn để xem chi tiết
    const selectedClub = ref(null); // Câu lạc bộ đang được chọn để xem chi tiết

    const openCourtModal = (court) => {
      selectedCourt.value = court;
    };

    const openClubModal = (club) => {
      selectedClub.value = club;
    };

    const handleViewClub = (club) => {
      openClubModal(club);
    };

    const formatTime = (timeStr) => {
      if (!timeStr) return '--:--';
      const date = new Date(timeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (amount) => {
      if (amount === undefined || amount === null) return '0đ';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const toggleRow = (id) => {
      if (expandedRows.value.includes(id)) {
        expandedRows.value = expandedRows.value.filter(rowId => rowId !== id);
      } else {
        expandedRows.value.push(id);
      }
    };

    // Đồng bộ tab từ URL
    const syncTabFromRoute = () => {
      const tabParam = route.params.tab;
      if (tabParam) {
        const tabId = tabParam.toUpperCase();
        if (['PENDING', 'LOCKED', 'ALL', 'APPROVED'].includes(tabId)) {
          activeTab.value = tabId;
        } else if (tabParam === 'all') {
          activeTab.value = 'all';
        }
      } else {
        activeTab.value = 'all';
      }
    };

    watch(() => route.params.tab, () => {
      syncTabFromRoute();
    });

    const handleTabChange = (id) => {
      activeTab.value = id;
      const pathParam = id === 'all' ? '' : id.toLowerCase();
      router.push(`/admin/courts/${pathParam}`);
    };

    const tabs = computed(() => [
      { id: 'all', label: 'Tất cả CLB', icon: 'LayoutGrid' },
      { id: 'PENDING', label: 'Chờ duyệt', icon: 'Clock', count: clubs.value.filter(c => c.approvalStatus === 'PENDING').length || 0 },
      { id: 'APPROVED', label: 'Đang hoạt động', icon: 'CheckCircle' },
      { id: 'LOCKED', label: 'Đã khóa', icon: 'Lock', count: clubs.value.filter(c => !c.isActive && c.approvalStatus === 'APPROVED').length || 0 },
    ]);

    const fetchClubs = async () => {
      loading.value = true;
      try {
        const response = await adminService.getAllClubs();
        clubs.value = response.data.data || [];
      } catch (error) {
        console.error("Lỗi khi tải danh sách CLB:", error);
      } finally {
        loading.value = false;
      }
    };

    const handleApproval = async (club, status) => {
      const actionText = status === 'APPROVED' ? 'phê duyệt' : 'từ chối';
      if (!confirm(`Bạn có chắc chắn muốn ${actionText} câu lạc bộ này?`)) return;

      try {
        await adminService.updateClubApproval(club.id, status);
        await fetchClubs();
      } catch (error) {
        alert("Lỗi khi cập nhật trạng thái!");
      }
    };

    const handleToggleStatus = async (club) => {
      const nextStatus = !club.isActive;
      const actionText = nextStatus ? 'mở khóa' : 'khóa';
      if (!confirm(`Bạn có chắc chắn muốn ${actionText} cơ sở này? (Lưu ý: Tất cả sân thuộc cơ sở cũng sẽ thay đổi theo)`)) return;

      try {
        await adminService.updateClubStatus(club.id, nextStatus);
        await fetchClubs();
      } catch (error) {
        alert("Lỗi khi cập nhật trạng thái hoạt động!");
      }
    };

    const handleToggleCourt = async (court) => {
      const nextStatus = court.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const actionText = nextStatus === 'ACTIVE' ? 'mở lại' : 'tạm dừng';
      
      try {
        await adminService.updateCourtStatus(court.id, nextStatus);
        await fetchClubs(); // Reload để cập nhật trạng thái sân trong list
        // Update selected court if it's currently open in modal
        if (selectedCourt.value && selectedCourt.value.id === court.id) {
          selectedCourt.value.status = nextStatus;
        }
      } catch (error) {
        alert("Lỗi khi cập nhật trạng thái sân!");
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '---';
      return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const counts = computed(() => ({
      total: clubs.value.length,
      pending: clubs.value.filter(c => c.approvalStatus === 'PENDING').length,
      active: clubs.value.filter(c => c.isActive && c.approvalStatus === 'APPROVED').length,
      locked: clubs.value.filter(c => !c.isActive && c.approvalStatus === 'APPROVED').length,
    }));

    const filteredCourts = computed(() => {
      let filtered = clubs.value;
      
      if (activeTab.value === 'PENDING') {
        filtered = filtered.filter(c => c.approvalStatus === 'PENDING');
      } else if (activeTab.value === 'APPROVED') {
        filtered = filtered.filter(c => c.isActive && c.approvalStatus === 'APPROVED');
      } else if (activeTab.value === 'LOCKED') {
        filtered = filtered.filter(c => !c.isActive && c.approvalStatus === 'APPROVED');
      }
      
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.owner?.fullName?.toLowerCase().includes(q)
        );
      }
      
      return filtered;
    });

    onMounted(() => {
      syncTabFromRoute();
      fetchClubs();
    });

    return {
      activeTab,
      searchQuery,
      tabs,
      clubs,
      loading,
      filteredCourts,
      counts,
      expandedRows,
      selectedCourt,
      selectedClub,
      toggleRow,
      openCourtModal,
      openClubModal,
      handleApproval,
      handleToggleStatus,
      handleToggleCourt,
      handleViewClub,
      handleTabChange,
      formatDate,
      formatTime,
      formatCurrency
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

/* Expansion & Nesting */
.club-row-group { border-bottom: 2px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
.expand-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.expand-btn:hover { background: var(--bg-hover); color: var(--accent); border-color: var(--accent); }

.expanded-row td { padding: 0; background: var(--bg-tertiary); }
.court-detail-list { padding: 20px 24px 24px 80px; animation: slideDown 0.3s ease-out; }
.detail-header { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
.detail-header::after { content: ''; flex: 1; height: 1px; background: var(--border); }

.court-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.court-mini-card { 
  background: var(--bg-secondary); 
  border: 1px solid var(--border); 
  border-radius: 12px; 
  padding: 12px 16px; 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  transition: all 0.2s;
  cursor: pointer;
}
.court-mini-card:hover { 
  border-color: var(--accent); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
.court-mini-card.suspended { opacity: 0.7; background: var(--bg-tertiary); border-style: dashed; }

.court-mini-name { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.court-mini-tag { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

.court-mini-actions { display: flex; align-items: center; gap: 12px; }
.status-indicator { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
.status-indicator.active { color: var(--green); background: var(--green-soft); }
.status-indicator.suspended { color: var(--red); background: var(--red-soft); }

.mini-action-btn { 
  width: 24px; height: 24px; border-radius: 6px; 
  border: 1px solid var(--border); background: var(--bg-tertiary); 
  color: var(--text-muted); cursor: pointer; 
  display: flex; align-items: center; justify-content: center; 
  transition: all 0.2s;
}
.mini-action-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }

/* Modal Styling */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-card {
  background: var(--bg-secondary);
  width: 90%; max-width: 500px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5);
  overflow: hidden;
  animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

.modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg-tertiary); }
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-title-group h3 { margin: 0; font-size: 18px; font-weight: 800; color: var(--text-primary); }
.status-tag { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
.status-tag.active { color: var(--green); background: var(--green-soft); }
.status-tag.suspended { color: var(--red); background: var(--red-soft); }
.close-modal { background: transparent; border: none; color: var(--text-muted); cursor: pointer; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.close-modal:hover { background: var(--bg-hover); color: var(--text-primary); }

.modal-body { padding: 24px; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.info-value { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.pricing-section { border-top: 1px solid var(--border); padding-top: 24px; }
.section-title { font-size: 13px; font-weight: 800; margin-bottom: 16px; color: var(--text-primary); }
.pricing-list { display: flex; flex-direction: column; gap: 8px; }
.pricing-item { background: var(--bg-tertiary); padding: 12px 16px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border); }
.price-time { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
.price-days { font-size: 11px; color: var(--text-muted); font-weight: 600; }
.price-value { color: var(--accent); font-weight: 800; font-size: 15px; }
.price-value small { font-size: 11px; vertical-align: baseline; opacity: 0.7; }
.empty-pricing { text-align: center; padding: 20px; color: var(--text-muted); font-style: italic; font-size: 13px; background: var(--bg-tertiary); border-radius: 10px; border: 1px dashed var(--border); }

.modal-footer { padding: 16px 24px; background: var(--bg-tertiary); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
.modal-btn { padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; }
.modal-btn.secondary { background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border); }
.modal-btn.secondary:hover { background: var(--bg-hover); color: var(--text-primary); }
.modal-btn.success { background: var(--green); color: white; }
.modal-btn.danger { background: var(--red); color: white; }
.modal-btn:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

/* Mini Stats */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.mini-stat { 
  background: var(--bg-secondary); 
  border: 1px solid var(--border); 
  border-radius: var(--radius-lg); 
  padding: 18px; 
  display: flex; 
  align-items: center; 
  gap: 16px; 
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.mini-stat:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.5); }
.mini-stat.active { border-color: var(--accent); background: var(--bg-tertiary); }

.mini-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.mini-icon.orange { background: var(--orange-soft); color: var(--orange); }
.mini-icon.green { background: var(--green-soft); color: var(--green); }
.mini-icon.red { background: var(--red-soft); color: var(--red); }
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
}
.tab-badge.pending { background: var(--orange); color: white; box-shadow: 0 2px 8px rgba(249,115,22,0.4); }
.tab-badge.locked { background: var(--red); color: white; box-shadow: 0 2px 8px rgba(239,68,68,0.4); }

/* Table Elements */
.mt-6 { margin-top: 24px; }
.table-toolbar { padding: 14px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--border); }
.search-input { display: flex; align-items: center; gap: 10px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; padding: 0 14px; height: 38px; width: 320px; transition: all 0.2s; }
.search-input input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 14px; width: 100%; }

.court-info-cell { display: flex; align-items: center; gap: 14px; }
.court-img { width: 40px; height: 40px; border-radius: 10px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); border: 1px solid var(--border); }
.court-name { font-size: 14px; font-weight: 700; color: var(--accent); }
.court-sub { font-size: 11px; color: var(--text-muted); font-weight: 500; margin-top: 2px; }

.owner-cell { display: flex; flex-direction: column; gap: 2px; }
.owner-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.phone { font-size: 11px; color: var(--text-muted); font-family: monospace; }

.approval-badge { display: inline-flex; align-items: center; height: 22px; padding: 0 10px; border-radius: 100px; font-size: 10px; font-weight: 700; text-transform: uppercase; border: 1px solid; }
.approval-badge.pending { color: var(--orange); border-color: rgba(249,115,22,0.2); background: var(--orange-soft); }
.approval-badge.approved { color: var(--green); border-color: rgba(34,197,94,0.2); background: var(--green-soft); }
.approval-badge.rejected { color: var(--red); border-color: rgba(239,68,68,0.2); background: var(--red-soft); }

.status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.status-badge.active { color: var(--green); }
.status-badge.active .dot { background: var(--green); box-shadow: 0 0 8px var(--green); }
.status-badge.locked { color: var(--text-muted); }
.status-badge.locked .dot { background: var(--red); }

.row-actions { display: flex; gap: 6px; }
.row-btn { width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.row-btn:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--accent); }
.row-btn.success-hover:hover { background: var(--green); color: white; border-color: var(--green); }
.row-btn.warning-hover:hover { background: var(--orange); color: white; border-color: var(--orange); }
.row-btn.danger-hover:hover { background: var(--red); color: white; border-color: var(--red); }

/* Banners */
.context-banner { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; font-size: 14px; line-height: 1.5; }
.pending-banner { background: var(--orange-soft); color: var(--orange); border: 1px solid rgba(249,115,22,0.1); }

/* Empty state */
.empty-ui { padding: 80px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.empty-icon-wrapper { width: 80px; height: 80px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 20px; border: 2px dashed var(--border); }

/* Club Modal Specifics */
.modal-card.wide { max-width: 800px; }
.club-hero { display: grid; grid-template-columns: 280px 1fr; gap: 24px; border-bottom: 1px solid var(--border); padding-bottom: 24px; }
.club-gallery { border-radius: 16px; overflow: hidden; background: var(--bg-tertiary); border: 1px solid var(--border); aspect-ratio: 4/3; }
.club-gallery img { width: 100%; height: 100%; object-fit: cover; }
.empty-img-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 12px; }

.club-essential { display: flex; flex-direction: column; gap: 8px; }
.club-display-name { font-size: 28px; font-weight: 850; color: var(--text-primary); margin: 0 0 8px 0; line-height: 1.1; }
.club-meta-item { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: 14px; font-weight: 500; }
.club-meta-item svg { color: var(--accent); opacity: 0.8; }

.approval-status-box { 
  margin-top: 12px; align-self: flex-start; padding: 6px 14px; border-radius: 10px; 
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; 
}
.approval-status-box.approved { background: var(--green-soft); color: var(--green); border: 1px solid rgba(34,197,94,0.15); }
.approval-status-box.pending { background: var(--orange-soft); color: var(--orange); border: 1px solid rgba(249,115,22,0.15); }
.approval-status-box.rejected { background: var(--red-soft); color: var(--red); border: 1px solid rgba(239,68,68,0.15); }

.modal-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.detail-section { display: flex; flex-direction: column; gap: 12px; }
.club-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin: 0; }

.owner-profile-card { 
  background: var(--bg-tertiary); padding: 16px; border-radius: 14px; 
  display: flex; align-items: center; gap: 14px; border: 1px solid var(--border);
}
.owner-avatar-mini { 
  width: 44px; height: 44px; border-radius: 12px; 
  background: var(--accent); color: white; 
  display: flex; align-items: center; justify-content: center; 
  font-weight: 800; font-size: 18px;
}
.owner-fn { font-weight: 700; color: var(--text-primary); font-size: 14px; }
.owner-ph { font-size: 12px; color: var(--text-muted); font-family: monospace; }

.mini-court-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; }
.m-court-item { 
  background: var(--bg-tertiary); padding: 10px 14px; border-radius: 8px; 
  display: flex; align-items: center; gap: 10px; border: 1px solid var(--border);
}
.m-court-name { font-size: 12px; font-weight: 700; color: var(--text-primary); flex: 1; }
.m-court-type { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.dot-status { width: 6px; height: 6px; border-radius: 50%; }
.dot-status.active { background: var(--green); box-shadow: 0 0 6px var(--green); }
.dot-status.suspended { background: var(--red); }

/* Utility */
.clickable { cursor: pointer; }
.link-hover:hover { color: var(--accent); text-decoration: underline; }
.court-img { overflow: hidden; border: 1px solid var(--border); }
.court-img img { width: 100%; height: 100%; object-fit: cover; }

.modal-body.custom-scrollbar { max-height: 70vh; overflow-y: auto; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

.modal-btn.warning { background: var(--orange); color: white; }

/* Existing Helpers Re-Check */
.page-header { margin-bottom: 24px; }
.title-icon { color: var(--accent); }
/* Court Modal Additional Styles */
.court-hero { display: flex; gap: 20px; align-items: flex-start; }
.court-gallery { 
  width: 160px; height: 160px; border-radius: 12px; overflow: hidden; 
  background: var(--bg-tertiary); border: 1px solid var(--border); flex-shrink: 0;
}
.court-gallery img { width: 100%; height: 100%; object-fit: cover; }

/* Helpers */
.text-right { text-align: right; }
.text-center { text-align: center; }
.justify-end { justify-content: flex-end; }
.p-0 { padding: 0 !important; }
.ml-auto { margin-left: auto; }
.font-bold { font-weight: 700; }
.mt-6 { margin-top: 24px; }
.mb-6 { margin-bottom: 24px; }
.flex-1 { flex: 1; }
</style>
