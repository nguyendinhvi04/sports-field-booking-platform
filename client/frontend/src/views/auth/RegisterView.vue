<template>
  <div class="register-page">
    
    <!-- Wrapper -->
    <div class="register-wrapper">
      <div class="register-card">

        <!-- Header row -->
        <div class="card-header">
          <h1 class="card-title">ĐĂNG KÝ</h1>
          <div class="login-wrap">
            <span class="login-hint">Đã có tài khoản?</span>
            <button class="btn-login-redirect" @click="goLogin">ĐĂNG NHẬP</button>
          </div>
        </div>

        <!-- Role selector -->
        <div class="role-group">
          <label
            class="role-option"
            :class="{ 'role-option--active': role === 'USER' }"
            @click="role = 'USER'"
          >
            <span class="role-checkbox" :class="{ 'role-checkbox--checked': role === 'USER' }">
              <svg v-if="role === 'USER'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Khách hàng
          </label>

          <label
            class="role-option"
            :class="{ 'role-option--active': role === 'OWNER' }"
            @click="role = 'OWNER'"
          >
            <span class="role-checkbox" :class="{ 'role-checkbox--checked': role === 'OWNER' }">
              <svg v-if="role === 'OWNER'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Chủ sân
          </label>
        </div>

        <!-- ── Họ và tên ── -->
        <div class="field-wrap">
          <label class="field-label">
            Họ và tên <span class="required">*</span>
          </label>
          <div class="input-field" :class="{ 'input-field--focus': focus.fullName, 'input-field--error': errors.fullName, 'input-field--valid': valid.fullName }">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              maxlength="100"
              @focus="focus.fullName = true"
              @blur="focus.fullName = false; validateField('fullName')"
              @input="clearError('fullName')"
            />
            <svg v-if="valid.fullName" class="icon-valid" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p v-if="errors.fullName" class="field-error">{{ errors.fullName }}</p>
          <p v-else class="field-hint">Từ 2 đến 100 ký tự.</p>
        </div>

        <!-- ── Email ── -->
        <div class="field-wrap">
          <label class="field-label">
            Địa chỉ email <span class="required">*</span>
          </label>
          <div class="input-field" :class="{ 'input-field--focus': focus.email, 'input-field--error': errors.email, 'input-field--valid': valid.email }">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m2 7 10 7 10-7"/>
            </svg>
            <input
              v-model="form.email"
              type="email"
              placeholder="example@email.com"
              @focus="focus.email = true"
              @blur="focus.email = false; validateField('email')"
              @input="clearError('email')"
            />
            <svg v-if="valid.email" class="icon-valid" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
          <p v-else class="field-hint">Dùng để đăng nhập và nhận thông báo.</p>
        </div>

        <!-- ── Mật khẩu ── -->
        <div class="field-wrap">
          <label class="field-label">
            Mật khẩu <span class="required">*</span>
          </label>
          <div class="input-field" :class="{ 'input-field--focus': focus.password, 'input-field--error': errors.password, 'input-field--valid': valid.password }">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Tối thiểu 6 ký tự"
              @focus="focus.password = true"
              @blur="focus.password = false; validateField('password')"
              @input="clearError('password'); updateStrength()"
            />
            <button class="toggle-pass" @click="showPassword = !showPassword" type="button" tabindex="-1">
              <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <!-- Password strength bar -->
          <div v-if="form.password" class="strength-bar">
            <div
              v-for="i in 4"
              :key="i"
              class="strength-segment"
              :class="getStrengthClass(i)"
            ></div>
            <span class="strength-label" :class="`strength-label--${strengthLevel}`">
              {{ strengthText }}
            </span>
          </div>
          <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
          <p v-else-if="!form.password" class="field-hint">Tối thiểu 6 ký tự.</p>
        </div>

        <!-- ── Số điện thoại (optional) ── -->
        <div class="field-wrap">
          <label class="field-label">
            Số điện thoại
            <span class="optional-tag">Không bắt buộc</span>
          </label>
          <div class="input-field" :class="{ 'input-field--focus': focus.phone, 'input-field--error': errors.phone, 'input-field--valid': valid.phone }">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l.85-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
            </svg>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="0912 345 678"
              maxlength="15"
              @focus="focus.phone = true"
              @blur="focus.phone = false; validateField('phone')"
              @input="clearError('phone')"
            />
            <svg v-if="valid.phone" class="icon-valid" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
          <p v-else class="field-hint">Định dạng VN: bắt đầu bằng 0 hoặc +84, đủ 10 số.</p>
        </div>

        <!-- ── Chấp nhận chính sách ── -->
        <div class="policy-wrap" :class="{ 'policy-wrap--error': errors.policy }">
          <label class="policy-label" @click="form.acceptPolicy = !form.acceptPolicy">
            <span class="policy-checkbox" :class="{ 'policy-checkbox--checked': form.acceptPolicy }">
              <svg v-if="form.acceptPolicy" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            <span class="policy-text">
              Tôi đã đọc và đồng ý với
              <a href="#" class="policy-link" @click.stop>Điều khoản dịch vụ</a>
              và
              <a href="#" class="policy-link" @click.stop>Chính sách bảo mật</a>
              của Playfinder.
            </span>
          </label>
          <p v-if="errors.policy" class="field-error">{{ errors.policy }}</p>
        </div>

        <!-- Submit -->
        <button class="btn-register" @click="handleRegister" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>TẠO TÀI KHOẢN</span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <span class="divider__line"></span>
          <span class="divider__text">HOẶC</span>
          <span class="divider__line"></span>
        </div>

        <!-- Social buttons -->
        <button class="btn-social" @click="handleGoogleLogin">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.13 0 5.95 1.08 8.17 2.85l6.1-6.1C34.36 3.07 29.45 1 24 1 14.82 1 7.03 6.48 3.36 14.27l7.2 5.59C12.29 13.65 17.67 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.87-2.2 5.3-4.67 6.93l7.19 5.59C42.99 37.24 46.1 31.36 46.1 24.55z"/>
            <path fill="#FBBC05" d="M10.56 28.62A14.57 14.57 0 0 1 9.5 24c0-1.6.27-3.16.75-4.63l-7.2-5.59A22.95 22.95 0 0 0 1 24c0 3.73.89 7.26 2.46 10.37l7.1-5.75z"/>
            <path fill="#34A853" d="M24 47c5.45 0 10.02-1.8 13.36-4.9l-7.19-5.59C28.22 38.01 26.22 38.5 24 38.5c-6.33 0-11.7-4.15-13.44-9.88l-7.1 5.75C7.03 42.52 14.82 47 24 47z"/>
          </svg>
          <span>Đăng ký bằng Google</span>
        </button>

        <button class="btn-social" @click="signInMicrosoft">
          <svg width="20" height="20" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          <span>Đăng ký bằng Microsoft</span>
        </button>

      </div>
    </div>

  </div>
</template>

<script>
import { authService } from '@/services/auth.service';

export default {
  name: 'RegisterPage',
  data() {
    return {
      role: 'USER',
      form: {
        fullName: '',
        email: '',
        password: '',
        phone: '',
        acceptPolicy: false,
      },
      errors: {
        fullName: '',
        email: '',
        password: '',
        phone: '',
        policy: '',
      },
      valid: {
        fullName: false,
        email: false,
        password: false,
        phone: false,
      },
      focus: {
        fullName: false,
        email: false,
        password: false,
        phone: false,
      },
      showPassword: false,
      passwordStrength: 0,
      loading: false,
    }
  },
  computed: {
    strengthLevel() {
      if (this.passwordStrength <= 1) return 'weak'
      if (this.passwordStrength === 2) return 'fair'
      if (this.passwordStrength === 3) return 'good'
      return 'strong'
    },
    strengthText() {
      const map = { weak: 'Yếu', fair: 'Trung bình', good: 'Khá tốt', strong: 'Mạnh' }
      return map[this.strengthLevel]
    },
  },
  methods: {
    clearError(field) {
      this.errors[field] = ''
    },

    updateStrength() {
      const p = this.form.password
      let score = 0
      if (p.length >= 6) score++
      if (p.length >= 10) score++
      if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
      if (/[0-9]/.test(p) && /[^a-zA-Z0-9]/.test(p)) score++
      this.passwordStrength = score
    },

    getStrengthClass(index) {
      const colors = { weak: 'seg--red', fair: 'seg--orange', good: 'seg--yellow', strong: 'seg--green' }
      return index <= this.passwordStrength ? colors[this.strengthLevel] : 'seg--empty'
    },

    validateField(field) {
      this.errors[field] = ''
      this.valid[field] = false

      if (field === 'fullName') {
        const v = this.form.fullName.trim()
        if (!v) { this.errors.fullName = 'Vui lòng nhập họ và tên.'; return }
        if (v.length < 2) { this.errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.'; return }
        if (v.length > 100) { this.errors.fullName = 'Họ và tên không quá 100 ký tự.'; return }
        this.valid.fullName = true
      }

      if (field === 'email') {
        const v = this.form.email.trim()
        if (!v) { this.errors.email = 'Vui lòng nhập địa chỉ email.'; return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { this.errors.email = 'Địa chỉ email không hợp lệ.'; return }
        this.valid.email = true
      }

      if (field === 'password') {
        const v = this.form.password
        if (!v) { this.errors.password = 'Vui lòng nhập mật khẩu.'; return }
        if (v.length < 6) { this.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.'; return }
        this.valid.password = true
      }

      if (field === 'phone') {
        const v = this.form.phone.trim()
        if (!v) { this.valid.phone = false; return } // optional
        const normalized = v.replace(/\s/g, '')
        const vnRegex = /^(0[3-9][0-9]{8}|\+84[3-9][0-9]{8})$/
        if (!vnRegex.test(normalized)) {
          this.errors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678).'
          return
        }
        this.valid.phone = true
      }
    },

    validateAll() {
      this.validateField('fullName')
      this.validateField('email')
      this.validateField('password')
      this.validateField('phone')
      this.errors.policy = ''
      if (!this.form.acceptPolicy) {
        this.errors.policy = 'Bạn cần đồng ý với điều khoản và chính sách bảo mật.'
      }
      return !this.errors.fullName && !this.errors.email && !this.errors.password && !this.errors.phone && !this.errors.policy
    },

    async handleRegister() {
      if (!this.validateAll()) return
      this.loading = true
      
      try {
        const payload = {
          fullName: this.form.fullName,
          email: this.form.email,
          password: this.form.password,
          phone: this.form.phone,
          role: this.role
        };

        await authService.register(payload);
        alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        this.$router.push('/auth/login');
      } catch (error) {
        console.error('Registration error:', error);
        const errorMsg = error.response?.data?.message || 'Đăng ký thất bại. Email hoặc số điện thoại có thể đã tồn tại.';
        alert(errorMsg);
      } finally {
        this.loading = false
      }
    },

    goLogin() {
      window.location.href = '/auth/login';
    },

    // --- Google Integrated Logic ---
    initGoogle() {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true; script.defer = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: "265183201039-tbm0nkoad98ftmn5pt43uiql7tnm3iuv.apps.googleusercontent.com",
          callback: (response) => {
            this.processSocialLogin(response.credential, 'google');
          }
        });
      };
      document.head.appendChild(script);
    },

    handleGoogleLogin() {
      if (!window.google) return alert("Google SDK chưa sẵn sàng.");
      window.google.accounts.id.prompt();
    },

    async processSocialLogin(token, provider) {
      if (!this.form.acceptPolicy) {
        this.errors.policy = 'Bạn cần đồng ý với điều khoản trước khi đăng ký bằng mạng xã hội.';
        return alert(this.errors.policy);
      }
      this.loading = true;
      try {
        const response = await authService.loginWithGoogle(token, this.role);
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        const userRole = response.data.data.user.role;
        if (userRole === 'OWNER') this.$router.push('/admin');
        else this.$router.push('/');
      } catch (error) {
        console.error(`${provider} Registration error:`, error);
        alert(`Đăng ký bằng ${provider} thất bại.`);
      } finally {
        this.loading = false;
      }
    },

    signInMicrosoft() { alert('Đăng ký bằng Microsoft') },
  },
  mounted() {
    this.initGoogle();
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.register-page {
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
.register-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px 48px;
}

/* ─── CARD ─── */
.register-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 32px 36px 28px;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

/* ─── CARD HEADER ─── */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.card-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 26px;
  letter-spacing: 1px;
  color: #1a1a2e;
}

.login-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-hint {
  font-size: 14px;
  color: #64748b;
}

.btn-login-redirect {
  background: #1e2a4a;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 1px;
  padding: 10px 18px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-login-redirect:hover { background: #162039; }

/* ─── ROLE SELECTOR ─── */
.role-group {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 11px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  user-select: none;
  background: #fafafa;
}

.role-option--active {
  border-color: #16a34a;
  background: #f0fdf4;
  color: #15803d;
}

.role-checkbox {
  width: 17px;
  height: 17px;
  border: 1.5px solid #cbd5e1;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: white;
  transition: border-color 0.2s, background 0.2s;
}
.role-checkbox--checked {
  background: #16a34a;
  border-color: #16a34a;
}

/* ─── FIELD WRAP ─── */
.field-wrap {
  margin-bottom: 16px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 7px;
}

.required {
  color: #ef4444;
  font-size: 14px;
  line-height: 1;
}

.optional-tag {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  background: #f1f5f9;
  border-radius: 20px;
  padding: 2px 8px;
  margin-left: 2px;
}

/* ─── INPUT FIELD ─── */
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
  padding: 13px 0;
}
.input-field input::placeholder { color: #9ca3af; }

.icon-valid { flex-shrink: 0; }

.toggle-pass {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}
.toggle-pass:hover { color: #475569; }

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

/* ─── PASSWORD STRENGTH ─── */
.strength-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.strength-segment {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  transition: background 0.3s;
}

.seg--empty  { background: #e2e8f0; }
.seg--red    { background: #ef4444; }
.seg--orange { background: #f97316; }
.seg--yellow { background: #eab308; }
.seg--green  { background: #16a34a; }

.strength-label {
  font-size: 11.5px;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}
.strength-label--weak   { color: #ef4444; }
.strength-label--fair   { color: #f97316; }
.strength-label--good   { color: #eab308; }
.strength-label--strong { color: #16a34a; }

/* ─── POLICY ─── */
.policy-wrap {
  margin-bottom: 20px;
  padding: 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  background: #fafafa;
  transition: border-color 0.2s;
}

.policy-wrap--error {
  border-color: #ef4444;
  background: #fff5f5;
}

.policy-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.policy-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid #cbd5e1;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: white;
  margin-top: 1px;
  transition: border-color 0.2s, background 0.2s;
}

.policy-checkbox--checked {
  background: #16a34a;
  border-color: #16a34a;
}

.policy-text {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.55;
}

.policy-link {
  color: #16a34a;
  font-weight: 600;
  text-decoration: none;
}
.policy-link:hover { text-decoration: underline; }

/* ─── REGISTER BUTTON ─── */
.btn-register {
  width: 100%;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 5px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 1.5px;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  min-height: 52px;
}
.btn-register:not(:disabled):hover { background: #4b5563; }
.btn-register:disabled { opacity: 0.7; cursor: not-allowed; }

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── DIVIDER ─── */
.divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.divider__line { flex: 1; height: 1px; background: #1a1a2e; }
.divider__text { font-size: 13px; font-weight: 600; color: #1a1a2e; letter-spacing: 1px; flex-shrink: 0; }

/* ─── SOCIAL BUTTONS ─── */
.btn-social {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: white;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 0;
  cursor: pointer;
  transition: background 0.15s;
  font-family: 'Barlow', sans-serif;
}
.btn-social:last-child { border-bottom: none; }
.btn-social:hover { background: #f8fafc; }
.btn-social svg { flex-shrink: 0; }
.btn-social span {
  font-size: 15px;
  font-weight: 600;
  color: #9ca3af;
}

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
  .register-card { padding: 24px 18px 20px; }
  .card-header { flex-direction: column; align-items: flex-start; gap: 14px; }
  .login-wrap { width: 100%; justify-content: space-between; }
  .role-group { flex-direction: column; }
}
</style>