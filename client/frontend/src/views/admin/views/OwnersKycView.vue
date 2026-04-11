<template>
  <div class="page">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu hồ sơ...</p>
    </div>

    <div class="page-header">
      <div class="page-title">
        <ShieldCheck :size="24" class="title-icon" />
        Phê duyệt Định danh (KYC)
        <span class="count">{{ pendingCount }} hồ sơ mới</span>
      </div>
      <div class="page-subtitle">Xác minh danh tính chủ Câu lạc bộ và thông tin thanh toán trước khi cho phép vận hành</div>
    </div>

    <!-- Filter Bar -->
    <div class="table-card">
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
          <input type="text" v-model="searchQuery" placeholder="Tìm tên chủ Câu lạc bộ, số điện thoại..." />
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Chủ Câu lạc bộ</th>
              <th>Số điện thoại</th>
              <th>Giấy tờ (KYC)</th>
              <th>Ngân hàng (Payout)</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in filteredOwners" :key="o.id">
              <td>
                <div class="owner-info">
                  <div class="owner-avatar">{{ o.user?.fullName?.charAt(0) }}</div>
                  <div>
                    <div class="owner-name">{{ o.user?.fullName }}</div>
                    <div class="owner-email">{{ o.user?.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ o.user?.phone || '---' }}</td>
              <td>
                <div class="doc-badge" @click="viewDocs(o)">
                  <FileText :size="12" /> Xem CCCD/GPKD
                </div>
              </td>
              <td>
                <div class="bank-info">
                  <div class="bank-name">{{ o.bankName || 'Chưa cập nhật' }}</div>
                  <div class="bank-acc">{{ o.bankAccountNumber || '---' }}</div>
                </div>
              </td>
              <td>{{ formatDate(o.createdAt) }}</td>
              <td>
                <div class="status-badge" :class="o.kycStatus.toLowerCase()">
                  <div class="dot"></div>
                  {{ statusLabels[o.kycStatus] || 'Chờ duyệt' }}
                </div>
              </td>
              <td>
                <div class="row-actions justify-end">
                  <button v-if="o.kycStatus === 'PENDING'" class="row-btn success" title="Duyệt hồ sơ" @click="approveKyc(o)">
                    <Check :size="14" />
                  </button>
                  <button v-if="o.kycStatus === 'PENDING'" class="row-btn danger" title="Từ chối" @click="rejectKyc(o)">
                    <X :size="14" />
                  </button>
                  <button class="row-btn" title="Xem chi tiết" @click="viewDocs(o)">
                    <Eye :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredOwners.length === 0 && !loading">
              <td colspan="7" class="empty-state">
                <Search :size="32" class="empty-icon" />
                <p>Không có hồ sơ nào khớp với bộ lọc hiện tại</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

        <!-- Modal Xem Giấy Tờ -->
    <div v-if="showDocModal" class="modal-overlay" @click="showDocModal = false">
      <div class="modal-content glass-modal" @click.stop>
        <div class="modal-header">
          <div class="header-with-icon">
             <div class="header-icon"><ShieldCheck :size="18" /></div>
             <div>
               <h3>Hồ sơ định danh chủ Câu lạc bộ</h3>
               <p class="modal-subtitle">{{ selectedOwner?.user?.fullName }} • ID: {{ selectedOwner?.id }}</p>
             </div>
          </div>
          <button class="close-btn" @click="showDocModal = false"><X :size="20" /></button>
        </div>
        
        <div class="modal-body custom-scrollbar">
          <!-- Status Banner -->
          <div v-if="selectedOwner?.kycStatus === 'REJECTED' && selectedOwner?.kycNote" class="status-banner rejected">
             <div class="banner-icon"><AlertCircle :size="16" /></div>
             <div class="banner-content">
                <strong>Hồ sơ bị từ chối:</strong> {{ selectedOwner.kycNote }}
             </div>
          </div>

          <div class="doc-section">
            <div class="section-label">Thông tin định danh (CCCD/Passport)</div>
            <div class="doc-grid">
              <div class="doc-item">
                <div class="img-preview-card">
                  <div class="img-header">Mặt trước</div>
                  <div class="img-body" v-if="selectedOwner?.idCardFrontUrl">
                    <img :src="selectedOwner.idCardFrontUrl" alt="CCCD Front" @click="openImage(selectedOwner.idCardFrontUrl)" />
                  </div>
                  <div v-else class="img-placeholder-v2">
                    <ImageOff :size="32" />
                    <span>Trống</span>
                  </div>
                </div>
              </div>
              <div class="doc-item">
                <div class="img-preview-card">
                  <div class="img-header">Mặt sau</div>
                  <div class="img-body" v-if="selectedOwner?.idCardBackUrl">
                    <img :src="selectedOwner.idCardBackUrl" alt="CCCD Back" @click="openImage(selectedOwner.idCardBackUrl)" />
                  </div>
                  <div v-else class="img-placeholder-v2">
                    <ImageOff :size="32" />
                    <span>Trống</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-columns mt-6">
            <div class="info-group">
              <div class="group-label"><User :size="14" /> Thông tin cá nhân</div>
              <div class="detail-card">
                <div class="detail-row">
                  <span class="label">Họ và tên:</span>
                  <span class="value">{{ selectedOwner?.user?.fullName }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Số định danh:</span>
                  <span class="value font-mono">{{ selectedOwner?.idCardNumber || 'Chưa cung cấp' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Email:</span>
                  <span class="value">{{ selectedOwner?.user?.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Điện thoại:</span>
                  <span class="value">{{ selectedOwner?.user?.phone }}</span>
                </div>
              </div>
            </div>

            <div class="info-group">
              <div class="group-label"><Building2Icon :size="14" /> Thông tin thanh toán (Payout)</div>
              <div class="detail-card accent">
                <div class="detail-row">
                  <span class="label">Ngân hàng:</span>
                  <span class="value">{{ selectedOwner?.bankName || '---' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Số tài khoản:</span>
                  <span class="value font-mono highlight">{{ selectedOwner?.bankAccountNumber || '---' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Chủ tài khoản:</span>
                  <span class="value">{{ selectedOwner?.bankAccountName || '---' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Chi nhánh:</span>
                  <span class="value">---</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="footer-btn ghost" @click="showDocModal = false">Đóng cửa sổ</button>
          <template v-if="selectedOwner?.kycStatus === 'PENDING'">
            <button class="footer-btn danger" @click="rejectKyc(selectedOwner)">
               <X :size="16" /> Từ chối hồ sơ
            </button>
            <button class="footer-btn success" @click="approveKyc(selectedOwner)">
               <Check :size="16" /> Phê duyệt danh tính
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { 
  ShieldCheck, Search, FileText, Check, X, Eye, 
  AlertCircle, ImageOff, User, Building2 as Building2Icon,
  Clock, XCircle, LayoutGrid
} from 'lucide-vue-next';
import { adminService } from '@/services/admin.service';

export default {
  name: 'OwnersKycView',
  components: {
    ShieldCheck, Search, FileText, Check, X, Eye, 
    AlertCircle, ImageOff, User, Building2Icon, Clock, XCircle, LayoutGrid
  },
  setup() {
    const activeTab = ref('pending');
    const searchQuery = ref('');
    const showDocModal = ref(false);
    const selectedOwner = ref(null);
    const owners = ref([]);
    const loading = ref(false);

    const tabs = [
      { id: 'pending', label: 'Chờ duyệt', icon: 'Clock' },
      { id: 'approved', label: 'Đã định danh', icon: 'ShieldCheck' },
      { id: 'rejected', label: 'Bị từ chối', icon: 'XCircle' }
    ];

    const statusLabels = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã xác minh',
      REJECTED: 'Bị từ chối'
    };

    const fetchOwners = async () => {
      loading.value = true;
      try {
        const response = await adminService.getAllKyc();
        owners.value = response.data.data || [];
      } catch (error) {
        console.error("Lỗi khi tải danh sách KYC:", error);
      } finally {
        loading.value = false;
      }
    };

    const pendingCount = computed(() => owners.value.filter(o => o.kycStatus === 'PENDING').length);

    const filteredOwners = computed(() => {
      let filtered = owners.value.filter(o => o.kycStatus === activeTab.value.toUpperCase());
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        filtered = filtered.filter(o => 
            o.user?.fullName?.toLowerCase().includes(q) || 
            o.user?.phone?.includes(q) ||
            o.user?.email?.toLowerCase().includes(q)
        );
      }
      return filtered;
    });

    const viewDocs = (owner) => {
      selectedOwner.value = { ...owner };
      showDocModal.value = true;
    };

    const approveKyc = async (owner) => {
      if(confirm(`Xác nhận phê duyệt định danh cho ${owner.user.fullName}? Tài khoản này sẽ có quyền vận hành Câu lạc bộ trên hệ thống.`)) {
        try {
          await adminService.updateKycStatus(owner.id, 'APPROVED');
          await fetchOwners();
          showDocModal.value = false;
          alert("Đã phê duyệt thành công!");
        } catch (error) {
          alert("Lỗi hệ thống: Không thể cập nhật trạng thái.");
        }
      }
    };

    const rejectKyc = async (owner) => {
      const reason = prompt('Lý do từ chối (Ví dụ: Ảnh mờ, Thông tin không khớp...):');
      if (reason === null) return;
      
      if (!reason.trim()) {
         alert("Vui lòng nhập lý do từ chối để thông báo cho chủ sân.");
         return;
      }

      try {
        await adminService.updateKycStatus(owner.id, 'REJECTED', reason);
        await fetchOwners();
        showDocModal.value = false;
        alert("Đã từ chối hồ sơ và gửi lý do cho chủ Câu lạc bộ.");
      } catch (error) {
        alert("Lỗi khi cập nhật trạng thái!");
      }
    };

    const formatDate = (dateStr) => {
       if (!dateStr) return '---';
       return new Date(dateStr).toLocaleDateString('vi-VN');
    }

    const openImage = (url) => {
       if (url) window.open(url, '_blank');
    }

    onMounted(fetchOwners);

    return {
      activeTab, searchQuery, tabs, filteredOwners, 
      statusLabels, pendingCount, showDocModal, selectedOwner,
      loading,
      viewDocs, approveKyc, rejectKyc, formatDate, openImage
    };
  }
}
</script>

<style scoped>
/* Page Styles */
.title-icon { color: var(--accent); }
.count { background: var(--orange); color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; margin-left: 10px; vertical-align: middle; }

.loading-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(var(--bg-rgb), 0.7);
  backdrop-filter: blur(4px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 50; border-radius: var(--radius-lg);
}
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }

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

.table-toolbar { padding: 14px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--border); }

/* Search Input */
.search-input { 
  display: flex; align-items: center; gap: 10px; background: var(--bg-tertiary); 
  border: 1px solid var(--border); border-radius: 8px; padding: 0 14px; 
  height: 38px; width: 320px; transition: all 0.2s; 
}
.search-input:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,110,247,0.15); }
.search-input input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 14px; width: 100%; }
.ml-auto { margin-left: auto; }

/* Table Info */
.owner-info { display: flex; align-items: center; gap: 12px; }
.owner-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--purple)); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.owner-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.owner-email { font-size: 11px; color: var(--text-muted); }

.doc-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; font-size: 11px; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
.doc-badge:hover { background: var(--bg-hover); color: var(--accent); border-color: var(--accent); box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.15); }

.bank-info { display: flex; flex-direction: column; gap: 2px; }
.bank-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.bank-acc { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }

/* Status Badges */
.status-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; background: rgba(var(--text-muted-rgb), 0.1); }
.status-badge .dot { width: 6px; height: 6px; border-radius: 50%; }
.status-badge.pending { color: var(--orange); background: var(--orange-soft); }
.status-badge.pending .dot { background: var(--orange); box-shadow: 0 0 8px var(--orange); }
.status-badge.approved { color: var(--green); background: rgba(34,197,94,0.1); }
.status-badge.approved .dot { background: var(--green); box-shadow: 0 0 8px var(--green); }
.status-badge.rejected { color: var(--red); background: rgba(239,68,68,0.1); }
.status-badge.rejected .dot { background: var(--red); }

/* Row Actions */
.row-actions { display: flex; gap: 8px; }
.row-btn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.row-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--bg-hover); transform: translateY(-2px); }
.row-btn.success:hover { background: var(--green); color: white; border-color: var(--green); box-shadow: 0 4px 12px rgba(34,197,94,0.3); }
.row-btn.danger:hover { background: var(--red); color: white; border-color: var(--red); box-shadow: 0 4px 12px rgba(239,68,68,0.3); }

/* Modal Premium */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
.glass-modal { background: rgba(26, 26, 26, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 720px; max-width: 95vw; box-shadow: 0 32px 64px rgba(0,0,0,0.5); overflow: hidden; animation: modalUp 0.3s ease-out; }
@keyframes modalUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

.modal-header { padding: 24px 30px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.header-with-icon { display: flex; align-items: center; gap: 16px; }
.header-icon { width: 40px; height: 40px; border-radius: 12px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--accent); border: 1px solid var(--border); }
.modal-header h3 { font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0; font-family: 'Barlow', sans-serif; }
.modal-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

.modal-body { padding: 30px; max-height: 70vh; overflow-y: auto; }

/* Status Banner */
.status-banner { display: flex; gap: 12px; padding: 14px 18px; border-radius: 12px; margin-bottom: 24px; font-size: 14px; }
.status-banner.rejected { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; }
.banner-icon { color: var(--red); flex-shrink: 0; }

.section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 16px; }

/* Doc Grid */
.doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.img-preview-card { border-radius: 14px; background: var(--bg-tertiary); border: 1px solid var(--border); overflow: hidden; }
.img-header { padding: 8px 14px; font-size: 11px; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.03); }
.img-body { height: 180px; position: relative; cursor: pointer; }
.img-body img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.img-body:hover img { transform: scale(1.05); }
.img-placeholder-v2 { height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text-muted); }
.img-placeholder-v2 span { font-size: 12px; font-weight: 600; }

/* Info Columns */
.info-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.group-label { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
.detail-card { background: var(--bg-tertiary); padding: 16px; border-radius: 12px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }
.detail-card.accent { border-left: 3px solid var(--accent); }
.detail-row { display: flex; justify-content: space-between; align-items: center; }
.detail-row .label { font-size: 12px; color: var(--text-muted); }
.detail-row .value { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.highlight { color: var(--accent) !important; font-weight: 700 !important; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

.modal-footer { padding: 20px 30px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; background: rgba(0,0,0,0.1); }
.footer-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; }
.footer-btn.ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
.footer-btn.ghost:hover { background: var(--bg-hover); color: var(--text-primary); }
.footer-btn.success { background: var(--green); color: white; box-shadow: 0 4px 15px rgba(34,197,94,0.3); }
.footer-btn.success:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(34,197,94,0.4); }
.footer-btn.danger { background: var(--red); color: white; }
.footer-btn.danger:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239,68,68,0.4); }

.empty-state { padding: 80px 0; text-align: center; color: var(--text-muted); }
.empty-icon { opacity: 0.15; margin-bottom: 16px; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
</style>

