<template>
  <div class="card">
    <h2>Forgot Password</h2>

    <p>Enter your email to reset your password</p>

    <div class="input-box">
      <input type="email" placeholder="Email Address" />
    </div>

    <button class="btn">Send Reset Link</button>
    <router-link to="/client/login">
      <a href="/client/login" class="back-login">
        Remember your password? Back to Login
      </a>
    </router-link>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
}

body {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #5f6fd2, #8c5dc9);
}

/* CARD */

.card {
  width: 420px;
  padding: 45px 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  text-align: center;
  color: white;
}

/* TITLE */

.card h2 {
  font-size: 32px;
  margin-bottom: 10px;
}

.card p {
  color: #e0e0ff;
  margin-bottom: 35px;
}

/* INPUT */

.input-box {
  margin-bottom: 25px;
}

.input-box input {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 15px;
  outline: none;
}

.input-box input::placeholder {
  color: #ddd;
}

/* BUTTON */

.btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  background: linear-gradient(90deg, #5a67f2, #00c9b7);
  margin-bottom: 20px;
  transition: 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* LINK */

.back-login {
  font-size: 14px;
  color: #00e0c6;
  text-decoration: none;
}

.back-login:hover {
  text-decoration: underline;
}
</style>
