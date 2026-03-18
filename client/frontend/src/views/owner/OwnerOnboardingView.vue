<template>
  <div class="onboarding-view">
    <div class="onboarding-container card">
      <!-- Steps Indicator -->
      <div class="steps-indicator">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-icon"><span class="material-icons">person</span></div>
          <p>Thông tin</p>
        </div>
        <div class="step-line" :class="{ active: currentStep >= 2 }"></div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-icon"><span class="material-icons">account_balance</span></div>
          <p>Thanh toán</p>
        </div>
        <div class="step-line" :class="{ active: currentStep >= 3 }"></div>
        <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
          <div class="step-icon"><span class="material-icons">verified</span></div>
          <p>Pháp lý</p>
        </div>
      </div>

      <!-- Step 1: Personal Info -->
      <div v-if="currentStep === 1" class="form-step fade-in">
        <div class="step-header">
          <h2>Thông tin Người đại diện</h2>
          <p>Vui lòng cung cấp thông tin chính xác để bảo vệ quyền lợi của bạn.</p>
        </div>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Họ và tên <span class="required">*</span></label>
            <input type="text" v-model="form.fullName" placeholder="VD: Nguyễn Bá Duy" />
          </div>
          <div class="form-group">
            <label>Số điện thoại Zalo / Hotline <span class="required">*</span></label>
            <input type="text" v-model="form.phone" placeholder="VD: 0987654321" />
          </div>
          <div class="form-group">
            <label>Số CCCD / CMND <span class="required">*</span></label>
            <input type="text" v-model="form.idNumber" placeholder="Nhập số thẻ căn cước" />
          </div>
        </div>
      </div>

      <!-- Step 2: Payment Details -->
      <div v-if="currentStep === 2" class="form-step fade-in">
        <div class="step-header">
          <h2>Tài khoản Nhận tiền định kỳ</h2>
          <p>Hệ thống sẽ chuyển tiền từ các đơn cọc/thanh toán vào tài khoản này.</p>
        </div>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Ngân hàng <span class="required">*</span></label>
            <select v-model="form.bankName">
              <option value="" disabled>-- Chọn ngân hàng --</option>
              <option value="vcb">Vietcombank</option>
              <option value="tcb">Techcombank</option>
              <option value="mbb">MB Bank</option>
              <option value="bidv">BIDV</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tên chủ tài khoản <span class="required">*</span></label>
            <input type="text" v-model="form.bankAccountName" placeholder="NGUYEN BA DUY" />
            <span class="hint">Phải trùng với họ tên pháp lý</span>
          </div>
          <div class="form-group">
            <label>Số tài khoản <span class="required">*</span></label>
            <input type="text" v-model="form.bankAccountNumber" placeholder="Nhập số tài khoản" />
          </div>
        </div>
      </div>

      <!-- Step 3: Legal Verification -->
      <div v-if="currentStep === 3" class="form-step fade-in">
        <div class="step-header">
          <h2>Hồ sơ Xác minh tính xác thực</h2>
          <p>Tải lên ảnh chụp rõ nét các giấy tờ liên quan để admin xét duyệt.</p>
        </div>
        <div class="upload-grid">
          <div class="upload-box">
            <span class="material-icons mb-icon">badge</span>
            <h4>Ảnh CCCD Mặt trước</h4>
            <button class="btn-upload">Chọn ảnh</button>
          </div>
          <div class="upload-box">
            <span class="material-icons mb-icon">badge</span>
            <h4>Ảnh CCCD Mặt sau</h4>
            <button class="btn-upload">Chọn ảnh</button>
          </div>
          <div class="upload-box full-width">
            <span class="material-icons mb-icon">assignment</span>
            <h4>Giấy phép Kinh doanh (Không bắt buộc)</h4>
            <p>Tăng độ uy tín hiển thị cho người đặt sân.</p>
            <button class="btn-upload">Chọn ảnh / PDF</button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="step-actions">
        <button v-if="currentStep > 1" class="btn-prev" @click="currentStep--">
          Quay lại
        </button>
        <div class="spacer"></div>
        <button v-if="currentStep < totalSteps" class="btn-next" @click="nextStep">
          Tiếp tục <span class="material-icons">east</span>
        </button>
        <button v-if="currentStep === totalSteps" class="btn-submit" @click="submitForm">
          Hoàn tất Định danh
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OwnerOnboardingView',
  data() {
    return {
      currentStep: 1,
      totalSteps: 3,
      isSubmitting: false,
      errors: {},
      form: {
        // Bước 1
        idNumber: '',
        // Bước 2
        bankName: '',
        bankAccountName: '',
        bankAccountNumber: '',
        // Bước 3 (tải ảnh – sẽ xử lý sau khi có storage)
        idCardFrontUrl: '',
        idCardBackUrl: '',
        businessLicenseUrl: '',
      }
    }
  },
  methods: {
    // Validate từng bước trước khi Next
    validateStep() {
      const errors = {};
      if (this.currentStep === 1) {
        if (!this.form.idNumber.trim()) errors.idNumber = 'Vui lòng nhập số CCCD/CMND';
      }
      if (this.currentStep === 2) {
        if (!this.form.bankName) errors.bankName = 'Vui lòng chọn ngân hàng';
        if (!this.form.bankAccountName.trim()) errors.bankAccountName = 'Vui lòng nhập tên chủ tài khoản';
        if (!this.form.bankAccountNumber.trim()) errors.bankAccountNumber = 'Vui lòng nhập số tài khoản';
      }
      this.errors = errors;
      return Object.keys(errors).length === 0;
    },

    nextStep() {
      if (this.validateStep()) {
        this.currentStep++;
      }
    },

    async submitForm() {
      if (!this.validateStep()) return;
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(
          '/api/owner/onboarding',
          {
            idCardNumber: this.form.idNumber,
            idCardFrontUrl: this.form.idCardFrontUrl || null,
            idCardBackUrl: this.form.idCardBackUrl || null,
            businessLicenseUrl: this.form.businessLicenseUrl || null,
            bankName: this.form.bankName,
            bankAccountNumber: this.form.bankAccountNumber,
            bankAccountName: this.form.bankAccountName,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Cập nhật thông tin user trong localStorage với isVerified mới = true
        const updatedUser = res.data?.data?.user;
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // Redirect vào Dashboard sau khi nộp hồ sơ thành công
        this.$router.push('/dashboard/owner');
      } catch (err) {
        const msg = err.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại.';
        alert(`Lỗi: ${msg}`);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

.onboarding-view {
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'DM Sans', sans-serif;
  color: #0f1623;
}

.onboarding-container {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(15,22,35,0.08);
}

/* Steps Indicator */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  padding: 0 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.step-icon {
  width: 48px; height: 48px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8;
  font-size: 20px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.step p {
  font-size: 13px; font-weight: 700; color: #94a3b8; margin: 0;
  text-transform: uppercase; letter-spacing: 0.05em;
  transition: all 0.3s;
}

.step.active .step-icon { background: #ecfdf5; color: #16a34a; border-color: #16a34a; }
.step.active p { color: #16a34a; }

.step.completed .step-icon { background: #16a34a; color: white; border-color: #16a34a; }

.step-line {
  flex: 1; height: 2px;
  background: #e2e8f0;
  margin: 0 16px;
  margin-bottom: 24px;
  position: relative;
  top: -12px;
  transition: all 0.3s;
}

.step-line.active { background: #16a34a; }

/* Form Area */
.form-step {
  min-height: 300px;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-header h2 {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 32px; font-weight: 800; color: #1e293b;
  margin: 0 0 8px 0; text-transform: uppercase;
}

.step-header p {
  font-size: 15px; color: #64748b; margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group.full-width { grid-column: span 2; }

.form-group label {
  display: block; font-size: 13px; font-weight: 700; color: #475569;
  margin-bottom: 8px;
}
.form-group label .required { color: #ef4444; }
.form-group input, .form-group select {
  width: 100%; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 12px;
  font-size: 15px; font-family: 'DM Sans', sans-serif;
  background: #f8fafc; transition: all 0.2s;
}
.form-group input:focus, .form-group select:focus {
  outline: none; border-color: #16a34a; background: white;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}
.hint { display: block; font-size: 11px; color: #94a3b8; margin-top: 6px; }

/* Upload Area */
.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.upload-box {
  background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px;
  padding: 30px 20px; text-align: center;
  transition: all 0.2s;
}
.upload-box:hover { border-color: #16a34a; background: #f0fdf4; }
.upload-box.full-width { grid-column: span 2; }

.mb-icon { font-size: 36px; color: #94a3b8; margin-bottom: 12px; }
.upload-box h4 { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
.upload-box p { font-size: 12px; color: #64748b; margin: 0 0 16px; }

.btn-upload {
  background: white; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 8px 16px; font-size: 13px; font-weight: 700; color: #475569;
  cursor: pointer; transition: all 0.2s;
}
.btn-upload:hover { border-color: #16a34a; color: #16a34a; }

/* Actions */
.step-actions {
  display: flex; align-items: center; margin-top: 40px;
  padding-top: 24px; border-top: 1px solid #f1f5f9;
}
.spacer { flex: 1; }

.btn-prev {
  background: transparent; border: none; font-size: 15px; font-weight: 700;
  color: #64748b; cursor: pointer; padding: 10px 20px; border-radius: 10px;
}
.btn-prev:hover { background: #f1f5f9; color: #1e293b; }

.btn-next, .btn-submit {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 700;
  border: none; cursor: pointer; transition: all 0.2s;
}

.btn-next { background: #1e293b; color: white; }
.btn-next:hover { background: #0f172a; transform: translateY(-2px); }

.btn-submit { background: #16a34a; color: white; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2); }
.btn-submit:hover { background: #15803d; transform: translateY(-2px); }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .onboarding-container { padding: 24px; }
  .form-grid, .upload-grid { grid-template-columns: 1fr; }
  .form-group.full-width, .upload-box.full-width { grid-column: span 1; }
  .step-line { display: none; }
}
</style>
