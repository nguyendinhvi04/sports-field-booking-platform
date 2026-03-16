<template>
  <nav class="navbar">
    <div class="navbar-left">
      <router-link to="/" class="logo">
        <img src="../../assets/logo.png" alt="Logo" width="40" height="40" style="object-fit: contain;" />
        <span>SPORTS BOOKING</span>
      </router-link>

      <div class="nav-menu">
        <router-link to="/" class="nav-menu-link">TRANG CHỦ</router-link>
        <router-link to="/booking" class="nav-menu-link">ĐẶT SÂN</router-link>
        <router-link to="/contact" class="nav-menu-link">BẢN ĐỒ</router-link>
        <router-link to="/about" class="nav-menu-link">GIỚI THIỆU</router-link>
        <button class="nav-search-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          TÌM KIẾM
        </button>
      </div>
    </div>

    <div class="navbar-right">
      <!-- Kiểm tra đăng nhập -->
      <template v-if="user">
        <span class="welcome-text">Chào, {{ user.fullName }}</span>
        <router-link to="/booking" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          QUẢN LÝ ĐẶT CHỖ
        </router-link>
        <button @click="handleLogout" class="nav-link btn-logout">
          ĐĂNG XUẤT
        </button>
      </template>

      <template v-else>
        <router-link to="/client/login" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          ĐĂNG NHẬP
        </router-link>
      </template>

      <router-link to="/owner" class="nav-link nav-link--cta">
        LIỆT KÊ ĐỊA ĐIỂM CỦA BẠN
      </router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: "ClientHeader",
  computed: {
    user() {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    }
  },
  methods: {
    handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Load lại trang để reset trạng thái
      window.location.href = "/";
    }
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap");

.navbar {
  font-family: "Barlow", sans-serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1a1a2e;
  padding: 0 40px;
  height: 80px;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  margin: 0;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 48px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: white;
  letter-spacing: 1.5px;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-menu-link {
  color: #e0e0e0;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
  transition: color 0.2s;
}

.nav-menu-link:hover {
  color: #4ade80;
}

.nav-search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #e0e0e0;
  font-family: "Barlow", sans-serif;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav-search-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e0e0e0;
  text-decoration: none;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.5px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link--cta {
  background: #16a34a;
  color: white;
  font-weight: 700;
  border-radius: 4px;
}

.nav-link--cta:hover {
  background: #15803d;
}

.welcome-text {
  color: #4ade80;
  font-weight: 700;
  font-size: 13px;
  margin-right: 12px;
}

.btn-logout {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  color: #ff4d4f;
}

.btn-logout:hover {
  background: rgba(255, 77, 79, 0.1);
  border-color: #ff4d4f;
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
}
</style>
