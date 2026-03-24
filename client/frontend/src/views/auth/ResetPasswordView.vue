<template>
  <div class="reset-page">
    <div class="reset-wrapper">
      <div class="reset-card">
        <template v-if="!success">
          <h1 class="card-title">ĐẶT LẠI MẬT KHẨU</h1>
          <p class="card-desc">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>

          <div class="field-wrap">
            <label class="field-label">Mật khẩu mới <span class="required">*</span></label>
            <div class="input-field" :class="{ 'input-field--focus': focusPass, 'input-field--error': errors.password }">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Tối thiểu 6 ký tự"
                @focus="focusPass = true"
                @blur="focusPass = false"
              />
            </div>
            <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
          </div>

          <div class="field-wrap">
            <label class="field-label">Xác nhận mật khẩu <span class="required">*</span></label>
            <div class="input-field" :class="{ 'input-field--focus': focusConfirm, 'input-field--error': errors.confirmPassword }">
              <input
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Nhập lại mật khẩu"
                @focus="focusConfirm = true"
                @blur="focusConfirm = false"
              />
            </div>
            <p v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</p>
          </div>

          <button class="btn-submit" @click="handleReset" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>ĐỔI MẬT KHẨU</span>
          </button>
        </template>

        <template v-else>
          <div class="success-icon">
            <div class="success-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <h1 class="card-title">THÀNH CÔNG!</h1>
          <p class="card-desc">Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ.</p>
          <button class="btn-submit" @click="goLogin">ĐĂNG NHẬP NGAY</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { authService } from '@/services/auth.service';

export default {
  name: 'ResetPasswordPage',
  data() {
    return {
      token: '',
      form: {
        password: '',
        confirmPassword: ''
      },
      errors: {
        password: '',
        confirmPassword: ''
      },
      focusPass: false,
      focusConfirm: false,
      showPassword: false,
      loading: false,
      success: false
    }
  },
  created() {
    this.token = this.$route.query.token;
    if (!this.token) {
      alert('Token không hợp lệ hoặc đã hết hạn.');
      this.$router.push('/auth/login');
    }
  },
  methods: {
    validate() {
      let isVal = true;
      if (this.form.password.length < 6) {
        this.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
        isVal = false;
      } else {
        this.errors.password = '';
      }
      if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
        isVal = false;
      } else {
        this.errors.confirmPassword = '';
      }
      return isVal;
    },
    async handleReset() {
      if (!this.validate()) return;
      this.loading = true;
      try {
        await authService.resetPassword(this.token, this.form.password, this.form.confirmPassword);
        this.success = true;
      } catch (error) {
        alert(error.response?.data?.message || 'Có lỗi xảy ra, token có thể đã hết hạn.');
      } finally {
        this.loading = false;
      }
    },
    goLogin() {
      this.$router.push('/auth/login');
    }
  }
}
</script>

<style scoped>
/* Kế thừa và tùy chỉnh CSS từ ForgotPasswordView */
.reset-page { font-family: 'Barlow', sans-serif; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
.reset-card { background: white; padding: 32px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; }
.card-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 24px; margin-bottom: 8px; color: #1a1a2e; }
.card-desc { font-size: 14px; color: #64748b; margin-bottom: 24px; }
.field-wrap { text-align: left; margin-bottom: 16px; }
.field-label { font-size: 13px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
.required { color: #ef4444; }
.input-field { border: 1.5px solid #d1d5db; border-radius: 5px; padding: 10px 14px; transition: 0.2s; }
.input-field--focus { border-color: #16a34a; }
.input-field--error { border-color: #ef4444; }
.input-field input { width: 100%; border: none; outline: none; font-size: 15px; }
.field-error { font-size: 12px; color: #ef4444; margin-top: 4px; }
.btn-submit { width: 100%; background: #16a34a; color: white; border: none; padding: 14px; border-radius: 5px; font-weight: 800; cursor: pointer; margin-top: 10px; transition: 0.2s; }
.btn-submit:hover { background: #15803d; }
.btn-submit:disabled { opacity: 0.6; }
.success-icon { display: flex; justify-content: center; margin-bottom: 20px; }
.success-circle { width: 64px; height: 64px; background: #16a34a; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
.spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
