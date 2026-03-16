<template>
  <div class="forgot-page">

    <!-- Wrapper -->
    <div class="forgot-wrapper">
      <div class="forgot-card">

        <!-- ── STEP 1: Nhập email ── -->
        <template v-if="step === 1">
          <button class="btn-back" @click="goLogin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>

            Quay lại đăng nhập
          </button>

          <div class="card-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.6">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1" fill="#16a34a"/>
            </svg>
          </div>

          <h1 class="card-title">QUÊN MẬT KHẨU</h1>
          <p class="card-desc">
            Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu vào hộp thư của bạn.
          </p>

          <!-- Email field -->
          <div class="field-wrap">
            <label class="field-label">
              Địa chỉ email <span class="required">*</span>
            </label>
            <div
              class="input-field"
              :class="{
                'input-field--focus': focusEmail,
                'input-field--error': errors.email,
                'input-field--valid': isEmailValid,
              }"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
              <input
                v-model="email"
                type="email"
                placeholder="example@email.com"
                @focus="focusEmail = true"
                @blur="focusEmail = false; validateEmail()"
                @input="errors.email = ''"
                @keyup.enter="handleSend"
              />
              <svg v-if="isEmailValid" class="icon-valid" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
            <p v-else class="field-hint">Chúng tôi sẽ gửi link đặt lại mật khẩu tới email này.</p>
          </div>

          <!-- Submit -->
          <button class="btn-submit" @click="handleSend" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <template v-else>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              GỬI ĐƯỜNG DẪN ĐẶT LẠI
            </template>
          </button>

          <div class="divider">
            <span class="divider__line"></span>
            <span class="divider__text">HOẶC</span>
            <span class="divider__line"></span>
          </div>

          <div class="alt-links">
            <span class="alt-text">Chưa có tài khoản?</span>
            <a href="#" class="alt-link" @click.prevent="goRegister">Đăng ký ngay</a>
          </div>
        </template>

        <!-- ── STEP 2: Đã gửi email ── -->
        <template v-else-if="step === 2">
          <div class="success-icon">
            <div class="success-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>

          <h1 class="card-title">KIỂM TRA EMAIL</h1>
          <p class="card-desc">
            Chúng tôi đã gửi đường dẫn đặt lại mật khẩu đến
          </p>
          <p class="email-highlight">{{ email }}</p>
          <p class="card-desc card-desc--sm">
            Vui lòng kiểm tra hộp thư đến (kể cả thư mục spam). Đường dẫn có hiệu lực trong <strong>30 phút</strong>.
          </p>

          <!-- Resend countdown -->
          <div class="resend-wrap">
            <template v-if="countdown > 0">
              <p class="resend-countdown">
                Gửi lại sau
                <span class="countdown-num">{{ countdown }}s</span>
              </p>
              <div class="countdown-bar">
                <div class="countdown-bar__fill" :style="{ width: `${(countdown / 60) * 100}%` }"></div>
              </div>
            </template>
            <button v-else class="btn-resend" @click="handleResend" :disabled="resending">
              <span v-if="resending" class="spinner spinner--sm"></span>
              <span v-else>Gửi lại email</span>
            </button>
          </div>

          <button class="btn-submit btn-submit--outline" @click="step = 1">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Đổi địa chỉ email
          </button>

          <button class="btn-back-login" @click="goLogin">
            Quay lại trang đăng nhập
          </button>
        </template>

      </div>

      <!-- Bottom note -->
      <p class="bottom-note">
        Bạn muốn quản lý sân của mình?
        <a href="#" class="bottom-link">Đăng nhập tại đây</a>
      </p>
    </div>

  </div>
</template>

<script>
import { authService } from '@/services/auth.service';

export default {
  name: 'ForgotPasswordPage',
  data() {
    return {
      step: 1,
      email: '',
      errors: { email: '' },
      focusEmail: false,
      loading: false,
      resending: false,
      countdown: 0,
      countdownTimer: null,
    }
  },
  computed: {
    isEmailValid() {
      return (
        !this.errors.email &&
        this.email.trim() !== '' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)
      )
    },
  },
  beforeDestroy() {
    clearInterval(this.countdownTimer)
  },
  methods: {
    validateEmail() {
      const v = this.email.trim()
      if (!v) { this.errors.email = 'Vui lòng nhập địa chỉ email.'; return false }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { this.errors.email = 'Địa chỉ email không hợp lệ.'; return false }
      this.errors.email = ''
      return true
    },

    async handleSend() {
      if (!this.validateEmail()) return
      this.loading = true
      try {
        await authService.forgotPassword(this.email.trim())
        this.step = 2
        this.startCountdown()
      } catch (error) {
        console.error('Forgot password error:', error);
        this.errors.email = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
      } finally {
        this.loading = false
      }
    },

    async handleResend() {
      this.resending = true
      try {
        await authService.forgotPassword(this.email.trim())
        this.startCountdown()
      } catch (error) {
        console.error('Resend error:', error);
        alert(error.response?.data?.message || 'Không thể gửi lại email vào lúc này.')
      } finally {
        this.resending = false
      }
    },

    startCountdown() {
      this.countdown = 60
      clearInterval(this.countdownTimer)
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
        } else {
          clearInterval(this.countdownTimer)
        }
      }, 1000)
    },

    goLogin() { window.location.href = '/client/login'; },
    goRegister() { window.location.href = '/client/register'; },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.forgot-page {
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
}

/* ─── TOP BAR ─── */
.top-bar {
  background: #4ade80;
  padding: 18px 24px 22px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 20px;
  color: #1a1a2e;
  letter-spacing: 1px;
  width: fit-content;
}

/* ─── WRAPPER ─── */
.forgot-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px 48px;
}

/* ─── CARD ─── */
.forgot-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 32px 36px 28px;
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

/* ─── BACK BUTTON ─── */
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  font-family: 'Barlow', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  margin-bottom: 24px;
  transition: color 0.2s;
  width: fit-content;
}
.btn-back:hover { color: #16a34a; }

/* ─── CARD ICON ─── */
.card-icon {
  width: 64px;
  height: 64px;
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

/* ─── TITLES ─── */
.card-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 26px;
  letter-spacing: 1px;
  color: #1a1a2e;
  margin-bottom: 10px;
}

.card-desc {
  font-size: 14.5px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
}

.card-desc--sm {
  font-size: 13.5px;
  margin-bottom: 24px;
}

/* ─── FIELD ─── */
.field-wrap { margin-bottom: 16px; }

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 7px;
}

.required { color: #ef4444; font-size: 14px; }

.input-field {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
  padding: 0 14px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field svg:first-child { color: #9ca3af; flex-shrink: 0; }
.input-field--focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.08); }
.input-field--focus svg:first-child { color: #16a34a; }
.input-field--error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.07); }
.input-field--error svg:first-child { color: #ef4444; }
.input-field--valid { border-color: #16a34a; }

.input-field input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'Barlow', sans-serif;
  font-size: 15px;
  color: #1e293b;
  background: transparent;
  padding: 14px 0;
}
.input-field input::placeholder { color: #9ca3af; }

.icon-valid { flex-shrink: 0; }

.field-error {
  font-size: 12px;
  color: #ef4444;
  margin-top: 5px;
  padding-left: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.field-error::before {
  content: '!';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.field-hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 5px;
  padding-left: 2px;
}

/* ─── SUBMIT BUTTON ─── */
.btn-submit {
  width: 100%;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 5px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 1.5px;
  padding: 15px 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  min-height: 52px;
}
.btn-submit:not(:disabled):hover { background: #4b5563; }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-submit--outline {
  background: white;
  color: #374151;
  border: 1.5px solid #d1d5db;
  margin-bottom: 12px;
  font-size: 14px;
}
.btn-submit--outline:not(:disabled):hover { background: #f8fafc; border-color: #94a3b8; }

/* ─── DIVIDER ─── */
.divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.divider__line { flex: 1; height: 1px; background: #1a1a2e; }
.divider__text { font-size: 13px; font-weight: 600; color: #1a1a2e; letter-spacing: 1px; flex-shrink: 0; }

/* ─── ALT LINKS ─── */
.alt-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.alt-text { font-size: 14px; color: #64748b; }

.alt-link {
  font-size: 14px;
  font-weight: 700;
  color: #16a34a;
  text-decoration: none;
}
.alt-link:hover { text-decoration: underline; }

/* ─── SUCCESS STATE ─── */
.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.success-circle {
  width: 72px;
  height: 72px;
  background: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.email-highlight {
  font-size: 15px;
  font-weight: 700;
  color: #1e2a4a;
  text-align: center;
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 5px;
  padding: 10px 16px;
  margin-bottom: 14px;
  word-break: break-all;
}

/* ─── RESEND ─── */
.resend-wrap {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.resend-countdown {
  font-size: 13.5px;
  color: #64748b;
  text-align: center;
}

.countdown-num {
  font-weight: 700;
  color: #1e2a4a;
  font-variant-numeric: tabular-nums;
}

.countdown-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.countdown-bar__fill {
  height: 100%;
  background: #16a34a;
  border-radius: 2px;
  transition: width 1s linear;
}

.btn-resend {
  background: none;
  border: 1.5px solid #16a34a;
  color: #16a34a;
  font-family: 'Barlow', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 24px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 140px;
  justify-content: center;
}
.btn-resend:hover { background: #f0fdf4; }
.btn-resend:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-back-login {
  background: none;
  border: none;
  font-family: 'Barlow', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  text-align: center;
  text-decoration: underline;
  padding: 4px 0;
  transition: color 0.2s;
}
.btn-back-login:hover { color: #64748b; }

/* ─── SPINNER ─── */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner--sm {
  width: 16px;
  height: 16px;
  border-color: rgba(22,163,74,0.3);
  border-top-color: #16a34a;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ─── BOTTOM NOTE ─── */
.bottom-note {
  margin-top: 28px;
  font-size: 14px;
  color: #64748b;
  text-align: center;
}

.bottom-link {
  color: #1a1a2e;
  font-weight: 600;
  text-decoration: underline;
}
.bottom-link:hover { color: #16a34a; }

/* ─── RESPONSIVE ─── */
@media (max-width: 560px) {
  .forgot-card { padding: 24px 18px 20px; }
}
</style>