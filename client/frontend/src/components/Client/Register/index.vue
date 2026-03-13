<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Create Account</h2>
      <p class="sub">Sign up to start booking sports fields</p>

      <input type="text" placeholder="Full Name" />

      <input type="email" placeholder="Email Address" />

      <input type="text" placeholder="Phone Number" />

      <input type="password" placeholder="Password" />

      <input type="password" placeholder="Confirm Password" />

      <!-- <div class="terms">
        <input type="checkbox" id="terms" />
        <label class="me-3" for="terms">I agree to Terms & Conditions</label>
      </div> -->

      <label class="remember-wrapper">
        <input type="checkbox" id="remember" name="remember" />
        <span class="checkbox-label">
          <span class="checkmark"></span>
          I agree to Terms & Conditions
        </span>
      </label>

      <button class="btn-main">Create Account</button>

      <div class="divider">
        <span>or sign up with</span>
      </div>

      <div class="social">
        <button class="btn-social google">
          <i class="fab fa-google"></i> Google
        </button>

        <button class="btn-social github">
          <i class="fa-brands fa-facebook"></i> Facebook
        </button>
      </div>

      <p class="login">
        <router-link to="/client/login">
          <a class="text-dark" href="">Already have an account?</a>
          <a href="/client/login">Sign in</a>
        </router-link>
      </p>
    </div>
  </div>
</template>

<style>
.auth-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #5f6fd2, #8a63d2);
  font-family: Arial;
}

.auth-card {
  width: 420px;
  padding: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  color: white;
}

.auth-card h2 {
  font-weight: 700;
  margin-bottom: 8px;
}

.sub {
  color: #e6e6ff;
  margin-bottom: 25px;
}

.auth-card input {
  width: 100%;
  padding: 14px;
  margin-bottom: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  outline: none;
}

.auth-card input::placeholder {
  color: #ddd;
}

.terms {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 20px;
}

.btn-main {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  color: white;
  background: linear-gradient(90deg, #5a67f2, #00c9b7);
  cursor: pointer;
  margin-bottom: 25px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ddd;
  margin-bottom: 20px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #bbb;
}

.social {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-social {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
}

.login {
  font-size: 14px;
}

.login a {
  color: #00e0c6;
  text-decoration: none;
  font-weight: bold;
}

.terms {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 15px 0 20px 0;
  font-size: 14px;
}

.terms input {
  cursor: pointer;
}

.terms label {
  cursor: pointer;
}
.terms label {
  color: white;
  cursor: pointer;
}
</style>
