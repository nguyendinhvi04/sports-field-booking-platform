<template>
  <div class="courts-view">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="view-header">
      <div class="header-info">
        <h1 class="view-title">Quản lý Sân đấu</h1>
        <p class="view-subtitle">Thiết lập thông tin, giá cả và trạng thái từng sân.</p>
      </div>
      <button class="add-btn" @click="openAddDrawer" :disabled="!selectedClubId">
        <span class="material-icons">add_circle</span>
        <span>Thêm sân mới</span>
      </button>
    </div>

    <!-- ── Control Bar ──────────────────────────────────────── -->
    <div class="control-bar">
      <div class="club-selector">
        <label>Chọn câu lạc bộ:</label>
        <select v-model="selectedClubId" @change="fetchCourts">
          <option value="" disabled>-- Chọn câu lạc bộ --</option>
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
        <select v-model="sportFilter">
          <option value="all">Tất cả loại sân</option>
          <option v-for="s in SPORT_TYPES" :key="s.value" :value="s.value">
            {{ s.emoji }} {{ s.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- ── Loading ──────────────────────────────────────────── -->
    <div v-if="loading" class="courts-grid">
      <div v-for="n in 4" :key="n" class="court-card">
        <div class="sk-banner"></div>
        <div class="sk-body">
          <div class="sk-line" style="width:60%"></div>
          <div class="sk-line" style="width:40%"></div>
        </div>
      </div>
    </div>

    <!-- ── No club selected ─────────────────────────────────── -->
    <div v-else-if="!selectedClubId" class="empty-state">
      <div class="empty-illustration">🏢</div>
      <h3>Chọn câu lạc bộ</h3>
      <p>Chọn một câu lạc bộ ở trên để xem và quản lý danh sách sân đấu.</p>
    </div>

    <!-- ── Courts Grid ──────────────────────────────────────── -->
    <div class="courts-grid" v-else-if="filteredCourts.length > 0">
      <div
        v-for="(court, i) in filteredCourts"
        :key="court.id"
        class="court-card"
        :style="`--delay: ${i * 80}ms`"
      >
        <!-- Colored header by sport -->
        <div class="court-header" :class="'sport-bg-' + court.sportType">
          <div class="ch-left">
            <span class="sport-emoji">{{ getSportEmoji(court.sportType) }}</span>
            <div class="sport-label">{{ getSportLabel(court.sportType) }}</div>
          </div>
          <div class="status-pill" :class="court.status === 'ACTIVE' ? 'active' : 'inactive'">
            <span class="dot"></span>
            {{ court.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng HĐ' }}
          </div>
        </div>

        <div class="court-body">
          <h3 class="court-name">{{ court.name }}</h3>
          <div class="court-meta">
            <div class="meta-item" v-if="court.indoorOutdoor">
              <span class="material-icons">{{ court.indoorOutdoor === 'INDOOR' ? 'roofing' : 'wb_sunny' }}</span>
              <span>{{ court.indoorOutdoor === 'INDOOR' ? 'Trong nhà' : 'Ngoài trời' }}</span>
            </div>
            <div class="meta-item" v-if="court.surface">
              <span class="material-icons">grass</span>
              <span>{{ court.surface }}</span>
            </div>
            <div class="meta-item" v-if="court.capacity">
              <span class="material-icons">groups</span>
              <span>{{ court.capacity }} người</span>
            </div>
          </div>
          <p class="court-desc" v-if="court.description">{{ court.description }}</p>
        </div>

        <div class="court-footer">
          <button class="footer-btn edit" @click="openEditDrawer(court)">
            <span class="material-icons">edit</span>
            <span>Sửa</span>
          </button>
          <button class="footer-btn delete" @click="openDeleteModal(court)">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Empty State ──────────────────────────────────────── -->
    <div v-else class="empty-state">
      <div class="empty-illustration">🏟️</div>
      <h3>Chưa có sân nào</h3>
      <p>Câu lạc bộ này chưa có sân đấu nào. Hãy thêm sân đầu tiên!</p>
      <button class="add-btn" style="margin:20px auto 0;display:inline-flex" @click="openAddDrawer">
        <span class="material-icons">add_circle</span>
        <span>Thêm sân mới</span>
      </button>
    </div>

    <!-- ══════════════════════════ DRAWER – THÊM SÂN ══════════════════════════ -->
    <transition name="drawer">
      <div class="drawer-overlay" v-if="showAddDrawer" @click.self="closeAddDrawer">
        <div class="drawer">
          <div class="drawer-header">
            <div class="drawer-title-row">
              <div class="drawer-icon add-icon"><span class="material-icons">add_home_work</span></div>
              <div>
                <h2 class="drawer-title">Thêm sân mới</h2>
                <p class="drawer-sub">{{ selectedClubName }}</p>
              </div>
            </div>
            <button class="drawer-close" @click="closeAddDrawer"><span class="material-icons">close</span></button>
          </div>

          <div class="drawer-body">
            <div v-if="addErrors.length > 0" class="form-alert error">
              <span class="material-icons">error_outline</span>
              <ul><li v-for="e in addErrors" :key="e">{{ e }}</li></ul>
            </div>

            <div class="form-grid">
              <div class="field full">
                <label>Tên sân <span class="req">*</span></label>
                <input v-model="addForm.name" type="text" placeholder="Sân A1 (Trong nhà)..."
                  :class="{ invalid: addSubmitted && !addForm.name }" />
                <span class="field-error" v-if="addSubmitted && !addForm.name">Vui lòng nhập tên sân.</span>
              </div>

              <div class="field full">
                <label>Loại thể thao <span class="req">*</span></label>
                <select v-model="addForm.sportType" :class="{ invalid: addSubmitted && !addForm.sportType }">
                  <option value="" disabled>-- Chọn loại thể thao --</option>
                  <option v-for="s in SPORT_TYPES" :key="s.value" :value="s.value">{{ s.emoji }} {{ s.label }}</option>
                </select>
                <span class="field-error" v-if="addSubmitted && !addForm.sportType">Vui lòng chọn loại thể thao.</span>
              </div>

              <div class="field">
                <label>Vị trí</label>
                <select v-model="addForm.indoorOutdoor">
                  <option value="">-- Không rõ --</option>
                  <option value="INDOOR">🏠 Trong nhà</option>
                  <option value="OUTDOOR">☀️ Ngoài trời</option>
                </select>
              </div>

              <div class="field">
                <label>Sức chứa (người)</label>
                <input v-model.number="addForm.capacity" type="number" min="1" placeholder="VD: 10" />
              </div>

              <div class="field full">
                <label>Mặt sân</label>
                <input v-model="addForm.surface" type="text" placeholder="Cỏ nhân tạo, Sàn gỗ, Bê tông..." />
              </div>

              <div class="field full">
                <label>Mô tả</label>
                <textarea v-model="addForm.description" rows="3" placeholder="Thêm thông tin về sân..."></textarea>
              </div>
            </div>
          </div>

          <div class="drawer-footer">
            <button class="btn-cancel" @click="closeAddDrawer">Hủy</button>
            <button class="btn-save" :disabled="addLoading" @click="submitAdd">
              <span v-if="addLoading" class="spinner"></span>
              <span class="material-icons" v-else>save</span>
              {{ addLoading ? 'Đang lưu...' : 'Thêm sân' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════════════════════ DRAWER – SỬA SÂN ═══════════════════════════ -->
    <transition name="drawer">
      <div class="drawer-overlay" v-if="showEditDrawer" @click.self="closeEditDrawer">
        <div class="drawer">
          <div class="drawer-header">
            <div class="drawer-title-row">
              <div class="drawer-icon edit-icon"><span class="material-icons">edit_note</span></div>
              <div>
                <h2 class="drawer-title">Chỉnh sửa sân</h2>
                <p class="drawer-sub">{{ editForm.name }}</p>
              </div>
            </div>
            <button class="drawer-close" @click="closeEditDrawer"><span class="material-icons">close</span></button>
          </div>

          <div class="drawer-body">
            <div v-if="editErrors.length > 0" class="form-alert error">
              <span class="material-icons">error_outline</span>
              <ul><li v-for="e in editErrors" :key="e">{{ e }}</li></ul>
            </div>
            <div v-if="editSuccess" class="form-alert success">
              <span class="material-icons">check_circle</span>
              <span>Cập nhật sân thành công!</span>
            </div>

            <div class="form-grid">
              <div class="field full">
                <label>Tên sân <span class="req">*</span></label>
                <input v-model="editForm.name" type="text" :class="{ invalid: editSubmitted && !editForm.name }" />
                <span class="field-error" v-if="editSubmitted && !editForm.name">Vui lòng nhập tên sân.</span>
              </div>

              <div class="field full">
                <label>Loại thể thao <span class="req">*</span></label>
                <select v-model="editForm.sportType" :class="{ invalid: editSubmitted && !editForm.sportType }">
                  <option value="" disabled>-- Chọn loại thể thao --</option>
                  <option v-for="s in SPORT_TYPES" :key="s.value" :value="s.value">{{ s.emoji }} {{ s.label }}</option>
                </select>
              </div>

              <div class="field">
                <label>Vị trí</label>
                <select v-model="editForm.indoorOutdoor">
                  <option value="">-- Không rõ --</option>
                  <option value="INDOOR">🏠 Trong nhà</option>
                  <option value="OUTDOOR">☀️ Ngoài trời</option>
                </select>
              </div>

              <div class="field">
                <label>Sức chứa (người)</label>
                <input v-model.number="editForm.capacity" type="number" min="1" />
              </div>

              <div class="field full">
                <label>Mặt sân</label>
                <input v-model="editForm.surface" type="text" />
              </div>

              <div class="field full">
                <label>Mô tả</label>
                <textarea v-model="editForm.description" rows="3"></textarea>
              </div>
            </div>
          </div>

          <div class="drawer-footer">
            <button class="btn-cancel" @click="closeEditDrawer">Hủy</button>
            <button class="btn-save" :disabled="editLoading" @click="submitEdit">
              <span v-if="editLoading" class="spinner"></span>
              <span class="material-icons" v-else>save</span>
              {{ editLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══════════════════════════ MODAL XÓA ═══════════════════════════════════ -->
    <transition name="fade">
      <div class="modal-overlay" v-if="showDeleteModal" @click.self="showDeleteModal = false">
        <div class="delete-modal">
          <div class="del-icon"><span class="material-icons">warning_amber</span></div>
          <h3>Xác nhận xoá</h3>
          <p>Bạn có chắc muốn xoá sân <strong>{{ deleteTarget.name }}</strong>?<br>Sân sẽ chuyển sang trạng thái không hoạt động.</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showDeleteModal = false">Hủy</button>
            <button class="btn-delete" :disabled="deleteLoading" @click="submitDelete">
              <span v-if="deleteLoading" class="spinner"></span>
              <span class="material-icons" v-else>delete_forever</span>
              {{ deleteLoading ? 'Đang xoá...' : 'Xoá sân' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { courtService } from '@/services/court.service';
import { clubService }  from '@/services/club.service';

const SPORT_TYPES = [
  { value: 'FOOTBALL',   label: 'Bóng đá',     emoji: '⚽' },
  { value: 'BADMINTON',  label: 'Cầu lông',    emoji: '🏸' },
  { value: 'TENNIS',     label: 'Tennis',       emoji: '🎾' },
  { value: 'PICKLEBALL', label: 'Pickleball',   emoji: '🏓' },
  { value: 'BASKETBALL', label: 'Bóng rổ',     emoji: '🏀' },
  { value: 'VOLLEYBALL', label: 'Bóng chuyền',  emoji: '🏐' },
  { value: 'OTHER',      label: 'Khác',         emoji: '🏅' },
];

function freshAdd() {
  return { name: '', sportType: '', indoorOutdoor: '', capacity: '', surface: '', description: '' };
}

export default {
  name: 'OwnerCourtsView',

  data() {
    return {
      SPORT_TYPES,
      clubs: [],
      courts: [],
      selectedClubId: '',
      searchQuery: '',
      sportFilter: 'all',
      loading: false,

      // Add
      showAddDrawer: false,
      addForm: freshAdd(),
      addSubmitted: false,
      addLoading: false,
      addErrors: [],

      // Edit
      showEditDrawer: false,
      editForm: {},
      editSubmitted: false,
      editLoading: false,
      editErrors: [],
      editSuccess: false,

      // Delete
      showDeleteModal: false,
      deleteTarget: { id: null, name: '' },
      deleteLoading: false,
    };
  },

  computed: {
    selectedClubName() {
      return this.clubs.find(c => c.id === this.selectedClubId)?.name ?? '';
    },
    filteredCourts() {
      return this.courts.filter(c => {
        const q = this.searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) &&
          (this.sportFilter === 'all' || c.sportType === this.sportFilter)
        );
      });
    },
  },

  async mounted() {
    await this.fetchClubs();
  },

  methods: {
    getSportLabel(type) { return SPORT_TYPES.find(s => s.value === type)?.label ?? type; },
    getSportEmoji(type) { return SPORT_TYPES.find(s => s.value === type)?.emoji ?? '🏅'; },

    // ── Fetch ──────────────────────────────────────────────
    async fetchClubs() {
      try {
        const res = await clubService.Getallthedetails();
        if (res.data.success) {
          this.clubs = res.data.data ?? [];
          if (this.clubs.length && !this.selectedClubId) {
            this.selectedClubId = this.clubs[0].id;
            await this.fetchCourts();
          }
        }
      } catch (e) { console.error('fetchClubs:', e); }
    },

    async fetchCourts() {
      if (!this.selectedClubId) return;
      this.loading = true;
      this.courts = [];
      try {
        const res = await courtService.getCourts(this.selectedClubId);
        if (res.data.success) this.courts = res.data.data ?? [];
      } catch (e) { console.error('fetchCourts:', e); }
      finally { this.loading = false; }
    },

    // ── Add ────────────────────────────────────────────────
    openAddDrawer() {
      this.addForm = freshAdd();
      this.addSubmitted = false;
      this.addErrors = [];
      this.showAddDrawer = true;
      document.body.style.overflow = 'hidden';
    },
    closeAddDrawer() { this.showAddDrawer = false; document.body.style.overflow = ''; },

    async submitAdd() {
      this.addSubmitted = true;
      if (!this.addForm.name || !this.addForm.sportType) return;
      this.addLoading = true;
      this.addErrors = [];
      try {
        const p = { name: this.addForm.name.trim(), sportType: this.addForm.sportType };
        if (this.addForm.indoorOutdoor)        p.indoorOutdoor = this.addForm.indoorOutdoor;
        if (this.addForm.capacity)             p.capacity      = Number(this.addForm.capacity);
        if (this.addForm.surface?.trim())      p.surface       = this.addForm.surface.trim();
        if (this.addForm.description?.trim())  p.description   = this.addForm.description.trim();

        const res = await courtService.createCourt(this.selectedClubId, p);
        if (res.data.success) {
          await this.fetchCourts();
          this.closeAddDrawer();
        }
      } catch (e) {
        const fe = e.response?.data?.errors;
        this.addErrors = fe ? Object.values(fe).flat() : [e.response?.data?.message ?? 'Có lỗi xảy ra.'];
      } finally { this.addLoading = false; }
    },

    // ── Edit ───────────────────────────────────────────────
    openEditDrawer(court) {
      this.editForm = {
        id:            court.id,
        name:          court.name          ?? '',
        sportType:     court.sportType      ?? '',
        indoorOutdoor: court.indoorOutdoor  ?? '',
        capacity:      court.capacity       ?? '',
        surface:       court.surface        ?? '',
        description:   court.description    ?? '',
      };
      this.editSubmitted = false;
      this.editErrors    = [];
      this.editSuccess   = false;
      this.showEditDrawer = true;
      document.body.style.overflow = 'hidden';
    },
    closeEditDrawer() { this.showEditDrawer = false; document.body.style.overflow = ''; },

    async submitEdit() {
      this.editSubmitted = true;
      if (!this.editForm.name || !this.editForm.sportType) return;
      this.editLoading = true;
      this.editErrors  = [];
      this.editSuccess = false;
      try {
        const p = { name: this.editForm.name.trim(), sportType: this.editForm.sportType };
        if (this.editForm.indoorOutdoor)       p.indoorOutdoor = this.editForm.indoorOutdoor;
        if (this.editForm.capacity)            p.capacity      = Number(this.editForm.capacity);
        if (this.editForm.surface?.trim())     p.surface       = this.editForm.surface.trim();
        if (this.editForm.description?.trim()) p.description   = this.editForm.description.trim();

        const res = await courtService.updateCourt(this.editForm.id, p);
        if (res.data.success) {
          await this.fetchCourts();
          this.editSuccess = true;
          setTimeout(() => this.closeEditDrawer(), 1400);
        }
      } catch (e) {
        const fe = e.response?.data?.errors;
        this.editErrors = fe ? Object.values(fe).flat() : [e.response?.data?.message ?? 'Có lỗi xảy ra.'];
      } finally { this.editLoading = false; }
    },

    // ── Delete ─────────────────────────────────────────────
    openDeleteModal(court) {
      this.deleteTarget = { id: court.id, name: court.name };
      this.showDeleteModal = true;
    },
    async submitDelete() {
      this.deleteLoading = true;
      try {
        const res = await courtService.deleteCourt(this.deleteTarget.id);
        if (res.data.success) {
          this.courts = this.courts.filter(c => c.id !== this.deleteTarget.id);
          this.showDeleteModal = false;
        }
      } catch (e) { alert('Có lỗi xảy ra khi xoá sân.'); }
      finally { this.deleteLoading = false; }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

/* ─── Root ───────────────────────────────────────────────── */
.courts-view { font-family:'Barlow Condensed',sans-serif; color:#0f1623; animation:fadeIn .4s ease-out; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

/* ─── Header ─────────────────────────────────────────────── */
.view-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; }
.view-title  { font-size:28px; font-weight:800; margin:0 0 4px; text-transform:uppercase; letter-spacing:.5px; }
.view-subtitle { font-family:'DM Sans',sans-serif; color:#64748b; font-size:14px; margin:0; }
.add-btn {
  display:flex; align-items:center; gap:8px;
  background:linear-gradient(135deg,#16a34a,#15803d); color:white; border:none;
  padding:12px 22px; border-radius:12px; font-weight:700; cursor:pointer;
  font-family:inherit; font-size:14px;
  transition:all .25s; box-shadow:0 4px 14px rgba(22,163,74,.35);
}
.add-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 20px rgba(22,163,74,.4); }
.add-btn:disabled { opacity:.5; cursor:not-allowed; }

/* ─── Control Bar ────────────────────────────────────────── */
.control-bar {
  display:flex; flex-wrap:wrap; gap:16px; margin-bottom:28px;
  background:white; padding:18px 20px; border-radius:16px; border:1px solid #eaecf2; align-items:flex-end;
}
.club-selector { display:flex; flex-direction:column; gap:6px; min-width:230px; }
.club-selector label { font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; }
.club-selector select, .filter-group select {
  padding:11px 14px; border:1px solid #e2e8f0; border-radius:10px;
  font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; background:#f8fafc;
}
.club-selector select:focus, .filter-group select:focus { outline:none; border-color:#16a34a; }
.search-box { flex:1; position:relative; min-width:200px; }
.search-box .material-icons { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94a3b8; }
.search-box input {
  width:100%; padding:12px 12px 12px 46px; border:1px solid #e2e8f0; border-radius:10px;
  font-family:'DM Sans',sans-serif; font-size:14px; background:#f8fafc; box-sizing:border-box;
}
.search-box input:focus { outline:none; border-color:#16a34a; background:white; }

/* ─── Grid ───────────────────────────────────────────────── */
.courts-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:22px; }
.court-card {
  background:white; border-radius:18px; border:1px solid #eaecf2; overflow:hidden;
  display:flex; flex-direction:column; transition:all .3s;
  animation:fadeSlideUp .5s ease both; animation-delay:var(--delay,0ms);
}
.court-card:hover { transform:translateY(-6px); box-shadow:0 14px 36px rgba(0,0,0,.07); border-color:#cbd5e1; }
@keyframes fadeSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

/* Skeleton */
.sk-banner { height:80px; background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
.sk-body { padding:18px; display:flex; flex-direction:column; gap:10px; }
.sk-line { height:13px; border-radius:6px; background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ─── Court Header (sport colored) ──────────────────────── */
.court-header {
  padding:16px 18px; display:flex; justify-content:space-between; align-items:center;
}
.sport-bg-FOOTBALL   { background:linear-gradient(135deg,#dcfce7,#bbf7d0); }
.sport-bg-BADMINTON  { background:linear-gradient(135deg,#ede9fe,#ddd6fe); }
.sport-bg-TENNIS     { background:linear-gradient(135deg,#fef9c3,#fde68a); }
.sport-bg-PICKLEBALL { background:linear-gradient(135deg,#ffedd5,#fed7aa); }
.sport-bg-BASKETBALL { background:linear-gradient(135deg,#fff7ed,#fed7aa); }
.sport-bg-VOLLEYBALL { background:linear-gradient(135deg,#e0f2fe,#bae6fd); }
.sport-bg-OTHER      { background:linear-gradient(135deg,#f1f5f9,#e2e8f0); }
.ch-left { display:flex; align-items:center; gap:10px; }
.sport-emoji { font-size:28px; line-height:1; }
.sport-label { font-size:13px; font-weight:700; color:#1e293b; font-family:'DM Sans',sans-serif; }
.status-pill { display:flex; align-items:center; gap:5px; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:700; padding:4px 10px; border-radius:100px; }
.status-pill .dot { width:6px; height:6px; border-radius:50%; }
.status-pill.active { background:rgba(255,255,255,.8); color:#15803d; }
.status-pill.active .dot { background:#16a34a; }
.status-pill.inactive { background:rgba(255,255,255,.6); color:#64748b; }
.status-pill.inactive .dot { background:#94a3b8; }

/* ─── Court Body ─────────────────────────────────────────── */
.court-body { padding:18px 18px 14px; flex:1; }
.court-name { font-size:18px; font-weight:800; margin:0 0 12px; color:#1e293b; }
.court-meta { display:flex; flex-direction:column; gap:7px; margin-bottom:8px; }
.meta-item { display:flex; align-items:center; gap:7px; font-family:'DM Sans',sans-serif; font-size:13px; color:#475569; }
.meta-item .material-icons { font-size:16px; color:#94a3b8; }
.court-desc { font-family:'DM Sans',sans-serif; font-size:13px; color:#64748b; margin:8px 0 0; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

/* ─── Court Footer ───────────────────────────────────────── */
.court-footer { padding:12px 18px; background:#f8fafc; display:flex; gap:8px; border-top:1px solid #f1f5f9; }
.footer-btn { height:36px; border-radius:9px; border:1px solid #e2e8f0; background:white; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; transition:all .2s; }
.footer-btn .material-icons { font-size:15px; }
.footer-btn.edit { flex:1; color:#1e293b; }
.footer-btn.delete { color:#ef4444; width:36px; }
.footer-btn:hover { background:#f1f5f9; transform:translateY(-1px); }
.footer-btn.delete:hover { background:#fef2f2; border-color:#fecaca; }

/* ─── Empty State ────────────────────────────────────────── */
.empty-state { text-align:center; padding:80px 20px; background:white; border-radius:20px; border:2px dashed #eaecf2; }
.empty-illustration { font-size:56px; margin-bottom:16px; }
.empty-state h3 { font-size:18px; font-weight:700; margin:0 0 8px; }
.empty-state p  { font-family:'DM Sans',sans-serif; font-size:14px; color:#64748b; margin:0; }

/* ─── Drawer ─────────────────────────────────────────────── */
.drawer-overlay { position:fixed; inset:0; z-index:1050; background:rgba(0,0,0,.45); backdrop-filter:blur(3px); display:flex; justify-content:flex-end; }
.drawer { width:480px; max-width:100vw; background:white; display:flex; flex-direction:column; height:100%; box-shadow:-8px 0 40px rgba(0,0,0,.12); }
.drawer-header { padding:22px 24px 18px; background:linear-gradient(135deg,#0f172a,#1e293b); display:flex; justify-content:space-between; align-items:flex-start; flex-shrink:0; }
.drawer-title-row { display:flex; align-items:center; gap:14px; }
.drawer-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
.drawer-icon.add-icon  { background:rgba(22,163,74,.25); }
.drawer-icon.edit-icon { background:rgba(59,130,246,.25); }
.drawer-icon .material-icons { color:white; font-size:22px; }
.drawer-title { font-size:18px; font-weight:800; color:white; margin:0 0 2px; }
.drawer-sub  { font-family:'DM Sans',sans-serif; font-size:13px; color:#94a3b8; margin:0; }
.drawer-close { background:rgba(255,255,255,.12); border:none; border-radius:8px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:white; transition:background .2s; }
.drawer-close:hover { background:rgba(255,255,255,.22); }
.drawer-body   { flex:1; overflow-y:auto; padding:22px 24px; }
.drawer-footer { padding:14px 24px; border-top:1px solid #f1f5f9; display:flex; gap:12px; flex-shrink:0; }

/* ─── Form ───────────────────────────────────────────────── */
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.field { display:flex; flex-direction:column; gap:6px; }
.field.full { grid-column:1/-1; }
.field label { font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:#374151; }
.field input, .field select, .field textarea {
  padding:10px 13px; border:1px solid #e2e8f0; border-radius:9px;
  font-family:'DM Sans',sans-serif; font-size:14px; background:#f8fafc; transition:border-color .2s, background .2s;
}
.field input:focus, .field select:focus, .field textarea:focus { outline:none; border-color:#16a34a; background:white; box-shadow:0 0 0 3px rgba(22,163,74,.08); }
.field input.invalid, .field select.invalid { border-color:#ef4444; }
.field textarea { resize:vertical; }
.req { color:#ef4444; }
.field-error { font-family:'DM Sans',sans-serif; font-size:12px; color:#ef4444; }
.form-alert { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; border-radius:10px; margin-bottom:16px; font-family:'DM Sans',sans-serif; font-size:13px; }
.form-alert.error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
.form-alert.success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
.form-alert ul { margin:0; padding-left:16px; }
.form-alert .material-icons { font-size:18px; flex-shrink:0; margin-top:1px; }

/* ─── Buttons ────────────────────────────────────────────── */
.btn-cancel { flex:1; padding:12px; border-radius:10px; border:1px solid #e2e8f0; background:white; font-weight:600; font-size:14px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .2s; }
.btn-cancel:hover { background:#f8fafc; }
.btn-save { flex:2; padding:12px; border-radius:10px; border:none; background:linear-gradient(135deg,#16a34a,#15803d); color:white; font-weight:700; font-size:14px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .25s; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 12px rgba(22,163,74,.3); }
.btn-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 18px rgba(22,163,74,.4); }
.btn-save:disabled { opacity:.65; cursor:not-allowed; }

/* ─── Delete Modal ───────────────────────────────────────── */
.modal-overlay { position:fixed; inset:0; z-index:1060; background:rgba(0,0,0,.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; }
.delete-modal { background:white; border-radius:20px; padding:32px 28px; width:400px; max-width:90vw; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,.2); animation:popIn .25s ease; }
@keyframes popIn { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
.del-icon { width:60px; height:60px; border-radius:50%; background:#fef2f2; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }
.del-icon .material-icons { font-size:30px; color:#ef4444; }
.delete-modal h3 { font-size:18px; font-weight:700; margin:0 0 8px; }
.delete-modal p  { font-family:'DM Sans',sans-serif; font-size:14px; color:#6b7280; margin:0 0 24px; line-height:1.6; }
.modal-actions { display:flex; gap:12px; }
.btn-delete { flex:1; padding:12px; border-radius:10px; border:none; background:linear-gradient(135deg,#ef4444,#dc2626); color:white; font-weight:700; font-size:14px; cursor:pointer; font-family:'DM Sans',sans-serif; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .2s; box-shadow:0 4px 12px rgba(239,68,68,.3); }
.btn-delete:hover:not(:disabled) { transform:translateY(-1px); }
.btn-delete:disabled { opacity:.65; cursor:not-allowed; }

/* ─── Spinner ────────────────────────────────────────────── */
.spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,.4); border-top-color:white; animation:spin .7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }

/* ─── Transitions ────────────────────────────────────────── */
.drawer-enter-active, .drawer-leave-active { transition:opacity .3s; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition:transform .3s cubic-bezier(.4,0,.2,1); }
.drawer-enter-from, .drawer-leave-to { opacity:0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform:translateX(100%); }
.fade-enter-active, .fade-leave-active { transition:opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity:0; }

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width:640px) {
  .view-header { flex-direction:column; align-items:flex-start; gap:14px; }
  .control-bar { flex-direction:column; }
  .courts-grid { grid-template-columns:1fr; }
  .drawer { width:100vw; }
}
</style>
