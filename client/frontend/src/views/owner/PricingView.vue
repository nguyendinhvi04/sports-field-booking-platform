<template>
  <div class="pricing-view fade-in">
    <div class="view-header">
      <div class="header-content">
        <h1 class="view-title">Quản lý Bảng giá & Khung giờ</h1>
        <p class="view-subtitle">Thiết lập linh hoạt giá tiền theo khung giờ, các ngày trong tuần và các dịp lễ đặc biệt cho từng sân bóng của bạn.</p>
      </div>
      <div class="court-selector-wrapper card">
        <label><span class="material-icons">sports_tennis</span> Chọn sân bóng:</label>
        <select v-model="selectedCourtId" @change="loadPricing" class="court-select">
          <option value="" disabled>-- Lựa chọn sân --</option>
          <option v-for="c in courts" :key="c.id" :value="c.id">{{ c.name }} ({{ c.clubName }})</option>
        </select>
      </div>
    </div>

    <div v-if="loadingCourts" class="loading-state card">
      <div class="spinner"></div>
      <p>Đang tải danh sách sân...</p>
    </div>

    <div v-else-if="courts.length === 0" class="empty-state card">
      <span class="material-icons">inventory_2</span>
      <h3>Bạn chưa có sân bóng nào</h3>
      <p>Vui lòng thêm sân bóng vào câu lạc bộ trước khi thiết lập bảng giá.</p>
      <router-link to="/owner/clubs" class="btn-primary mt-16">Quản lý câu lạc bộ</router-link>
    </div>

    <div v-else-if="!selectedCourtId" class="select-prompt card">
      <span class="material-icons">arrow_upward</span>
      <h3>Chưa chọn sân bóng</h3>
      <p>Vui lòng chọn một sân bóng ở phía trên để bắt đầu cấu hình giá.</p>
    </div>

    <template v-else>
      <div class="pricing-grid">
        <!-- Cột bên trái: Bảng giá định kỳ -->
        <div class="pricing-card card regular-section">
          <div class="card-header">
            <div class="header-main">
              <span class="icon-circle regular"><span class="material-icons">calendar_month</span></span>
              <div>
                <h3>Bảng giá Định kỳ</h3>
                <p>Áp dụng lặp lại theo Thứ trong tuần</p>
              </div>
            </div>
            <button class="btn-add" @click="openModal('regular')">
              <span class="material-icons">add</span> Thêm mới
            </button>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ngày áp dụng</th>
                  <th>Khung giờ</th>
                  <th>Giá / Giờ</th>
                  <th>Nhãn</th>
                  <th class="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in regularPricings" :key="p.id">
                  <td>
                    <span v-if="p.dayOfWeek === null" class="badge-day all">Hàng ngày</span>
                    <span v-else class="badge-day highlight">{{ getDayName(p.dayOfWeek) }}</span>
                  </td>
                  <td class="time-range">{{ formatTime(p.startTime) }} - {{ formatTime(p.endTime) }}</td>
                  <td class="price-val">{{ formatPrice(p.pricePerHour) }}</td>
                  <td><span v-if="p.label" class="label-tag">{{ p.label }}</span><span v-else>-</span></td>
                  <td class="text-right">
                    <button class="btn-icon delete" @click="deleteConfirm('regular', p.id)" title="Xóa">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="regularPricings.length === 0">
                  <td colspan="5" class="empty-table">Chưa có cấu hình giá định kỳ.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cột bên phải: Bảng giá ngày lễ -->
        <div class="pricing-card card special-section">
          <div class="card-header">
            <div class="header-main">
              <span class="icon-circle special"><span class="material-icons">celebration</span></span>
              <div>
                <h3>Giá Ngày Lễ & Đặc biệt</h3>
                <p>Ưu tiên áp dụng cho ngày cụ thể</p>
              </div>
            </div>
            <button class="btn-add special" @click="openModal('special')">
              <span class="material-icons">stars</span> Thêm ngày lễ
            </button>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Khung giờ</th>
                  <th>Giá / Giờ</th>
                  <th>Ghi chú</th>
                  <th class="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in specialPricings" :key="s.id">
                  <td><span class="date-val">{{ formatDate(s.specificDate) }}</span></td>
                  <td class="time-range">{{ formatTime(s.startTime) }} - {{ formatTime(s.endTime) }}</td>
                  <td class="price-val special">{{ formatPrice(s.pricePerHour) }}</td>
                  <td class="note-cell">{{ s.note || '-' }}</td>
                  <td class="text-right">
                    <button class="btn-icon delete" @click="deleteConfirm('special', s.id)" title="Xóa">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="specialPricings.length === 0">
                  <td colspan="5" class="empty-table">Chưa có cấu hình giá ngày đặc biệt.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal Form -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
        <div class="modal-content pricing-modal card">
          <div class="modal-header">
            <div class="modal-title-group">
               <span class="material-icons modal-icon">{{ modalType === 'regular' ? 'schedule' : 'event' }}</span>
               <h3>{{ modalType === 'regular' ? 'Thêm Giá Định Kỳ' : 'Thêm Giá Ngày Đặc Biệt' }}</h3>
            </div>
            <button class="btn-close" @click="showModal = false"><span class="material-icons">close</span></button>
          </div>
          
          <div class="modal-body">
            <div class="form-row">
              <div v-if="modalType === 'regular'" class="form-group full">
                <label>Ngày áp dụng trong tuần</label>
                <select v-model="form.dayOfWeek" class="form-input">
                  <option :value="null">Tất cả các ngày</option>
                  <option :value="1">Thứ Hai</option>
                  <option :value="2">Thứ Ba</option>
                  <option :value="3">Thứ Tư</option>
                  <option :value="4">Thứ Năm</option>
                  <option :value="5">Thứ Sáu</option>
                  <option :value="6">Thứ Bảy</option>
                  <option :value="0">Chủ Nhật</option>
                </select>
              </div>
              <div v-else class="form-group full">
                <label>Chọn ngày áp dụng</label>
                <input type="date" v-model="form.specificDate" class="form-input" />
              </div>
            </div>

            <div class="form-row split">
              <div class="form-group">
                <label>Giờ bắt đầu</label>
                <input type="time" v-model="form.startTime" class="form-input" />
              </div>
              <div class="form-group">
                <label>Giờ kết thúc</label>
                <input type="time" v-model="form.endTime" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full">
                <label>Giá tiền mỗi giờ (VNĐ)</label>
                <div class="price-input-wrapper">
                  <input type="number" v-model="form.pricePerHour" class="form-input price" placeholder="VD: 250000" />
                  <span class="currency-label">VNĐ</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full">
                <label>{{ modalType === 'regular' ? 'Nhãn (VD: Giờ vàng)' : 'Ghi chú (VD: Lễ 30/4)' }}</label>
                <input type="text" v-model="form.label" class="form-input" :placeholder="modalType === 'regular' ? 'VD: Khung giờ sáng' : 'VD: Ngày giải phóng'" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="showModal = false">Quay lại</button>
            <button class="btn-submit" @click="handleSave" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-small"></span>
              {{ isSaving ? 'Đang lưu...' : 'Xác nhận lưu' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OwnerPricingView',
  data() {
    return {
      courts: [],
      selectedCourtId: '',
      regularPricings: [],
      specialPricings: [],
      loadingCourts: true,
      showModal: false,
      modalType: 'regular',
      isSaving: false,
      form: {
        id: null,
        dayOfWeek: null,
        specificDate: '',
        startTime: '06:00',
        endTime: '22:00',
        pricePerHour: 200000,
        label: ''
      }
    };
  },
  mounted() {
    this.loadCourts();
  },
  methods: {
    async loadCourts() {
      this.loadingCourts = true;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/owner/courts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.courts = res.data?.data || [];
        if (this.courts.length > 0) {
          this.selectedCourtId = this.courts[0].id;
          this.loadPricing();
        }
      } catch (e) {
        console.error('Lỗi tải danh sách sân', e);
      } finally {
        this.loadingCourts = false;
      }
    },

    async loadPricing() {
      if (!this.selectedCourtId) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/owner/courts/${this.selectedCourtId}/pricing`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data?.data || {};
        this.regularPricings = data.regularPricings || [];
        this.specialPricings = data.specialPricings || [];
      } catch (e) {
        console.error('Lỗi tải bảng giá', e);
      }
    },

    openModal(type) {
      this.modalType = type;
      this.form = {
        id: null,
        dayOfWeek: null,
        specificDate: new Date().toISOString().split('T')[0],
        startTime: '06:00',
        endTime: '22:00',
        pricePerHour: 200000,
        label: ''
      };
      this.showModal = true;
    },

    async handleSave() {
      if (!this.selectedCourtId) return;
      this.isSaving = true;
      try {
        const token = localStorage.getItem('token');
        const isSpecial = this.modalType === 'special';
        
        const payload = {
          startTime: this.form.startTime + ":00",
          endTime: this.form.endTime + ":00",
          pricePerHour: Number(this.form.pricePerHour),
        };

        if (isSpecial) {
           payload.specificDate = this.form.specificDate;
           payload.note = this.form.label;
        } else {
           payload.dayOfWeek = this.form.dayOfWeek;
           payload.label = this.form.label;
        }

        const method = isSpecial ? 'put' : 'post';
        await axios[method](`/api/owner/courts/${this.selectedCourtId}/pricing`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.showModal = false;
        this.loadPricing();
      } catch (e) {
        alert(e.response?.data?.message || 'Có lỗi xảy ra');
      } finally {
        this.isSaving = false;
      }
    },

    async deleteConfirm(type, id) {
      if (!confirm('Bạn có chắc muốn xóa khung giờ này?')) return;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/owner/courts/${this.selectedCourtId}/pricing?type=${type}&id=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.loadPricing();
      } catch (e) {
        alert('Xóa thất bại');
      }
    },

    // Formatters
    getDayName(d) {
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      return days[d];
    },
    formatTime(t) {
      if (!t) return '--:--';
      const date = new Date(t);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    },
    formatPrice(p) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  }
};
</script>

<style scoped>
.pricing-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  gap: 24px;
}

.view-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 32px;
  font-weight: 800;
  text-transform: uppercase;
  color: #1e293b;
  margin-bottom: 8px;
}

.view-subtitle {
  color: #64748b;
  font-size: 16px;
}

.court-selector-wrapper {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 300px;
}

.court-selector-wrapper label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.court-select {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 10px;
  border-radius: 10px;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
}

/* Common Card style */
.card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
}

/* Grid & Cards */
.pricing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle.regular { background: #eff6ff; color: #3b82f6; }
.icon-circle.special { background: #f5f3ff; color: #8b5cf6; }

.card-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.card-header p {
  font-size: 13px;
  color: #94a3b8;
}

/* Buttons */
.btn-add {
  background: #1e293b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}

.btn-add:hover { background: #0f172a; transform: translateY(-2px); }
.btn-add.special { background: #7c3aed; }
.btn-add.special:hover { background: #6d28d9; }

/* Table Style */
.table-container { padding: 8px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f8fafc;
  color: #334155;
}

.badge-day {
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
}
.badge-day.all { background: #f1f5f9; color: #64748b; }
.badge-day.highlight { background: #dcfce7; color: #166534; }

.price-val { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; color: #0f172a; }
.price-val.special { color: #7c3aed; }

.label-tag { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #475569; }

.btn-icon.delete {
  color: #ef4444; background: transparent; border: none; padding: 6px; border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.btn-icon.delete:hover { background: #fef2f2; }

/* Modal Styles */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}

.pricing-modal { width: 100%; max-width: 500px; overflow: hidden; animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-icon { color: #3b82f6; }

.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 8px; }
.form-input { 
  width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; 
  font-family: inherit; font-size: 14px; background: #f8fafc;
}
.form-input:focus { outline: none; border-color: #3b82f6; background: white; }

.split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.price-input-wrapper { position: relative; }
.price-input-wrapper .price { padding-right: 60px; font-weight: 700; font-size: 18px; color: #16a34a; }
.currency-label { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-weight: 700; font-size: 13px; }

.modal-footer { padding: 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; }
.btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-submit { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* Transitions */
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* States */
.loading-state, .empty-state, .select-prompt {
  padding: 80px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
}
.empty-state span, .select-prompt span { font-size: 64px; color: #e2e8f0; }
.loading-state .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .pricing-grid { grid-template-columns: 1fr; }
  .view-header { flex-direction: column; align-items: stretch; }
}
</style>
