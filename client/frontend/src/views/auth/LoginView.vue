<template>
  <div class="login-page">

    <!-- Card -->
    <div class="login-wrapper">
      <div class="login-card">

        <!-- Header row -->
        <div class="card-header">
          <h1 class="card-title">ĐĂNG NHẬP</h1>
          <div class="register-wrap">
            <span class="register-hint">Chưa có tài khoản?</span>
            <button class="btn-register" @click="goRegister">ĐĂNG KÝ</button>
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

        <!-- Email field -->
        <div class="input-field" :class="{ 'input-field--focus': focusEmail, 'input-field--error': errors.email }">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m2 7 10 7 10-7"/>
          </svg>
          <input
            v-model="form.email"
            type="email"
            placeholder="Địa chỉ email"
            @focus="focusEmail = true"
            @blur="focusEmail = false; validateEmail()"
          />
        </div>
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>

        <!-- Password field -->
        <div class="input-field" :class="{ 'input-field--focus': focusPass, 'input-field--error': errors.password }">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Mật khẩu"
            @focus="focusPass = true"
            @blur="focusPass = false; validatePassword()"
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
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>

        <!-- Forgot password -->
        <div class="forgot-row">
          <a href="/auth/forgot-password" class="forgot-link">Quên mật khẩu?</a>
        </div>

        <!-- Submit button -->
        <button class="btn-login" @click="handleLogin" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>ĐĂNG NHẬP BẰNG MẬT KHẨU</span>
        </button>

        <!-- Divider OR -->
        <div class="divider">
          <span class="divider__line"></span>
          <span class="divider__text">HOẶC</span>
          <span class="divider__line"></span>
        </div>

        <!-- Social buttons -->
        <button class="btn-social" @click="handleGoogleLogin">
          <!-- Google G icon -->
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.13 0 5.95 1.08 8.17 2.85l6.1-6.1C34.36 3.07 29.45 1 24 1 14.82 1 7.03 6.48 3.36 14.27l7.2 5.59C12.29 13.65 17.67 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.87-2.2 5.3-4.67 6.93l7.19 5.59C42.99 37.24 46.1 31.36 46.1 24.55z"/>
            <path fill="#FBBC05" d="M10.56 28.62A14.57 14.57 0 0 1 9.5 24c0-1.6.27-3.16.75-4.63l-7.2-5.59A22.95 22.95 0 0 0 1 24c0 3.73.89 7.26 2.46 10.37l7.1-5.75z"/>
            <path fill="#34A853" d="M24 47c5.45 0 10.02-1.8 13.36-4.9l-7.19-5.59C28.22 38.01 26.22 38.5 24 38.5c-6.33 0-11.7-4.15-13.44-9.88l-7.1 5.75C7.03 42.52 14.82 47 24 47z"/>
          </svg>
          <span>Đăng nhập bằng Google</span>
        </button>

        <button class="btn-social" @click="handleFacebookLogin">
          <!-- Facebook icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Đăng nhập bằng Facebook</span>
        </button>

        <!-- <button class="btn-social" @click="signInMicrosoft"> -->
          <!-- Microsoft icon -->
          <!-- <svg width="20" height="20" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          <span>Đăng nhập bằng Microsoft</span>
        </button> -->

      </div>
    </div>

  </div>
</template>

<script>
import { authService } from '@/services/auth.service';

export default {
  name: 'LoginPage',
  data() {
    return {
      role: 'USER',
      form: {
        email: '',
        password: '',
      },
      errors: {
        email: '',
        password: '',
      },
      showPassword: false,
      focusEmail: false,
      focusPass: false,
      loading: false,
    }
  },
  methods: {
    validateEmail() {
      if (!this.form.email) {
        this.errors.email = 'Vui lòng nhập địa chỉ email.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = 'Địa chỉ email không hợp lệ.'
      } else {
        this.errors.email = ''
      }
    },
    validatePassword() {
      if (!this.form.password) {
        this.errors.password = 'Vui lòng nhập mật khẩu.'
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.'
      } else {
        this.errors.password = ''
      }
    },
    async handleLogin() {
      this.validateEmail()
      this.validatePassword()
      if (this.errors.email || this.errors.password) return
      this.loading = true
      
      try {
        const response = await authService.login(this.form.email, this.form.password);
        
        // 1. Lưu Token và thông tin User
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        // 2. Điều hướng dựa trên Role từ BE
        const userRole = response.data.data.user.role;
        if(this.role === userRole){
        if (userRole === 'OWNER') {
          this.$router.push('/owner');
        } else if(userRole === 'USER') {
          this.$router.push('/');
        }
        }
        else {
            alert("Sai quyền tài khoản");
            this.role = "";
            this.form.email = "";
            this.form.password = "";
        }
      } catch (error) {
        console.error('Login error:', error);
        const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
        alert(errorMsg);
      } finally {
        this.loading = false
      }
    },
    goRegister() {
      this.$router.push('/auth/register');
    },
    signInGoogle() {
      alert('Đăng nhập bằng Google')
    },
    signInMicrosoft() {
      alert('Đăng nhập bằng Microsoft')
    },

    // --- Facebook Login ---
    initFacebook() {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId      : '1129002909328616', // ID ứng dụng từ Meta
          cookie     : true,
          xfbml      : true,
          version    : 'v18.0'
        });
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    },

    // --- Google Login ---
    initGoogle() {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
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
      if (!window.google) {
        alert("Google SDK chưa sẵn sàng.");
        return;
      }
      window.google.accounts.id.prompt(); // One Tap
      // Hoặc dùng nút bấm tùy chỉnh
    },

    handleFacebookLogin() {
      if (!window.FB) {
        alert("Facebook SDK chưa sẵn sàng. Vui lòng thử lại sau.");
        return;
      }

      window.FB.login((response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          this.processSocialLogin(accessToken, 'facebook');
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      }, { scope: 'public_profile,email' });
    },

    async processSocialLogin(token, provider) {
      this.loading = true;
      try {
        let response;
        if (provider === 'facebook') {
          response = await authService.loginWithFacebook(token, this.role);
        } else if (provider === 'google') {
          response = await authService.loginWithGoogle(token, this.role);
        }
        
        // Lưu Token và điều hướng (tương tự login thường)
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        const userRole = response.data.data.user.role;
        if (userRole === 'OWNER') {
          this.$router.push('/admin');
        } else {
          this.$router.push('/');
        }
      } catch (error) {
        console.error(`${provider} Login error:`, error);
        alert(`Đăng nhập bằng ${provider} thất bại.`);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.initFacebook();
    this.initGoogle();
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.login-page {
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
  text-decoration: none;
  width: fit-content;
}

/* ─── WRAPPER ─── */
.login-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px 48px;
}

/* ─── CARD ─── */
.login-card {
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

.register-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.register-hint {
  font-size: 14px;
  color: #64748b;
}

.btn-register {
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
.btn-register:hover { background: #162039; }

/* ─── ROLE SELECTOR ─── */
.role-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
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

.role-option svg {
  flex-shrink: 0;
  color: currentColor;
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

/* ─── INPUT FIELDS ─── */
.input-field {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
  padding: 0 14px;
  margin-bottom: 10px;
  background: white;
  transition: border-color 0.2s;
}

.input-field svg { color: #9ca3af; flex-shrink: 0; }

.input-field--focus { border-color: #16a34a; }
.input-field--focus svg { color: #16a34a; }

.input-field--error { border-color: #ef4444; }
.input-field--error svg { color: #ef4444; }

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
  margin-top: -6px;
  margin-bottom: 8px;
  padding-left: 2px;
}

/* Forgot password */
.forgot-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 18px;
  margin-top: -2px;
}

.forgot-link {
  font-size: 13px;
  color: #16a34a;
  text-decoration: none;
  font-weight: 500;
}
.forgot-link:hover { text-decoration: underline; }

/* ─── LOGIN BUTTON ─── */
.btn-login {
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

.btn-login:not(:disabled):hover { background: #4b5563; }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

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

.divider__line {
  flex: 1;
  height: 1px;
  background: #1a1a2e;
}

.divider__text {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: 1px;
  flex-shrink: 0;
}

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

.btn-social svg {
  flex-shrink: 0;
}

.btn-social span {
  font-size: 15px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.2px;
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
  .login-card {
    padding: 24px 18px 20px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .role-group {
    flex-direction: column;
  }

  .register-wrap {
    width: 100%;
    justify-content: space-between;
  }
}
</style>