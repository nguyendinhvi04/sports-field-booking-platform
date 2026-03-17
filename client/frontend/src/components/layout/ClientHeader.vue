<template>
  <nav class="navbar" :class="{ 'navbar--mobile-open': isMenuOpen }">
    <div class="navbar-container">
      <div class="navbar-left">
        <router-link to="/" class="logo">
          <img src="../../assets/logo.png" alt="Logo" width="40" height="40" style="object-fit: contain;" />
          <span>SPORTS BOOKING</span>
        </router-link>

        <div class="nav-menu desktop-only">
          <router-link to="/" class="nav-menu-link">TRANG CHỦ</router-link>
          <router-link to="/booking" class="nav-menu-link">ĐẶT SÂN</router-link>
          <router-link to="/contact" class="nav-menu-link">BẢN ĐỒ</router-link>
          <router-link to="/contact" class="nav-menu-link">TÌM BẠN</router-link>
          <router-link to="/about" class="nav-menu-link">GIỚI THIỆU</router-link>
      <button 
        class="nav-search-btn" 
        :class="{ 'nav-search-btn--active': isInternalSearchActive }" 
        @click.stop.prevent="toggleSearch"
        @mousedown.stop
      >
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
        <span>TÌM KIẾM</span>
      </button>
    </div> <!-- close nav-menu -->
    </div> <!-- close navbar-left -->



      <div class="navbar-right desktop-only">
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
          <router-link to="/auth/login" class="nav-link">
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

      <!-- Hamburger Button (Mobile only) -->
      <button class="hamburger-btn" @click="toggleMenu" :aria-expanded="isMenuOpen" aria-label="Toggle menu">
        <div class="hamburger-icon" :class="{ 'open': isMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>
    
    <!-- Search Dropdown Overlay -->
    <transition name="search-dropdown">
      <div v-if="isInternalSearchActive" class="client-search-overlay" @click.stop @mousedown.stop>
        <div class="search-bar-container">
          <p class="search-hint">Choose a sport and search by location or venue</p>
          <div class="search-inputs">
            <!-- Sport Select -->
            <div class="search-field search-field--select">
              <div class="search-field__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 0 20M2 12h20M12 2a15 15 0 0 0 0 20"/>
                </svg>
              </div>
              <select v-model="selectedSportSearch" class="search-input--hidden" @click.stop>
                <option value="Basketball">Basketball</option>
                <option value="Football">Bóng đá</option>
                <option value="Badminton">Cầu lông</option>
                <option value="Tennis">Tennis</option>
              </select>
              <div class="search-chevron">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            <!-- Location Input -->
            <div class="search-field search-field--input">
              <div class="search-field__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <input 
                v-model="locationSearch" 
                type="text" 
                placeholder="Insert a location or a venue" 
                class="search-text-input"
                @click.stop
              />
              <button class="search-locate-btn" @click.stop>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>

            <!-- CTA Button -->
            <button class="search-cta-btn" @click.stop="handleSearch">
              <span class="cta-accent">FIND</span> VENUE
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Mobile Menu Overlay -->
    <transition name="mobile-menu">
      <div v-if="isMenuOpen" class="mobile-menu-overlay" @click.self="closeMenu">
        <div class="mobile-menu-content">
          <div class="mobile-menu-header">
            <router-link @click="closeMenu" to="/" class="logo">
              <img src="../../assets/logo.png" alt="Logo" width="32" height="32" />
              <span>SPORTS BOOKING</span>
            </router-link>
          </div>

          <div class="mobile-nav-links">
            <router-link @click="closeMenu" to="/" class="mobile-nav-item">TRANG CHỦ</router-link>
            <router-link @click="closeMenu" to="/booking" class="mobile-nav-item">ĐẶT SÂN</router-link>
            <router-link @click="closeMenu" to="/contact" class="mobile-nav-item">BẢN ĐỒ</router-link>
            <router-link @click="closeMenu" to="/contact" class="mobile-nav-item">TÌM BẠN</router-link>
            <router-link @click="closeMenu" to="/about" class="mobile-nav-item">GIỚI THIỆU</router-link>
            <div class="divider"></div>
            
            <template v-if="user">
              <div class="user-info-mobile">
                <span class="welcome-text">Chào, {{ user.fullName }}</span>
              </div>
              <router-link @click="closeMenu" to="/booking" class="mobile-nav-item">
                QUẢN LÝ ĐẶT CHỖ
              </router-link>
              <button @click="handleLogout" class="mobile-nav-item btn-logout-mobile">
                ĐĂNG XUẤT
              </button>
            </template>
            <template v-else>
              <router-link @click="closeMenu" to="/auth/login" class="mobile-nav-item">
                ĐĂNG NHẬP
              </router-link>
            </template>

            <router-link @click="closeMenu" to="/owner" class="mobile-nav-item mobile-nav-item--cta">
              LIỆT KÊ ĐỊA ĐIỂM
            </router-link>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script>
export default {
  name: "ClientHeader",
  data() {
    return {
      isMenuOpen: false,
      isInternalSearchActive: false,
      selectedSportSearch: "Basketball",
      locationSearch: ""
    };
  },
  computed: {
    user() {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      if (this.isMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    closeMenu() {
      this.isMenuOpen = false;
      document.body.style.overflow = '';
    },
    toggleSearch() {
      console.log("Toggle Search triggered. Previous state:", this.isInternalSearchActive);
      this.isInternalSearchActive = !this.isInternalSearchActive;
      if (this.isInternalSearchActive) {
        this.isMenuOpen = false;
        console.log("Search is now OPENED via toggleSearch");
      } else {
        console.log("Search is now CLOSED via toggleSearch");
      }
    },
    closeSearch() {
      this.isInternalSearchActive = false;
    },
    handleSearch() {
      console.log("handleSearch triggered for:", this.selectedSportSearch, this.locationSearch);
      
      const queryParams = {};
      if (this.selectedSportSearch) queryParams.sport = this.selectedSportSearch;
      if (this.locationSearch) queryParams.city = this.locationSearch;
      
      this.$router.push({ path: '/booking', query: queryParams });
      
      this.closeSearch();
    },
    handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    },
    handleOutsideClick() {
      if (this.isInternalSearchActive) {
        this.closeSearch();
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap");

.navbar {
  font-family: "Barlow", sans-serif;
  background: #1a1a2e;
  height: 80px;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  margin: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.navbar-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 0 1 auto;
  min-width: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 800;
  font-size: 22px; /* Slightly smaller base */
  color: white;
  letter-spacing: 1.2px;
  text-decoration: none;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.logo:hover {
  transform: translateY(-1px);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 16px; /* Reduced gap */
  flex-shrink: 0;
}

.nav-menu-link {
  color: #e0e0e0;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
  padding: 8px 0;
  position: relative;
  white-space: nowrap;
}

.nav-menu-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #4ade80;
  transition: width 0.2s ease;
}

.nav-menu-link:hover {
  color: #4ade80;
}

.nav-menu-link:hover::after {
  width: 100%;
}

.nav-search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
  font-family: "Barlow", sans-serif;
  font-weight: 600;
  font-size: 12px; /* Uniform with links */
  letter-spacing: 0.4px;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.nav-search-btn:hover,
.nav-search-btn--active {
  background: #16a34a; 
  border-color: #16a34a;
  color: white;
  transform: translateY(-1px);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px; /* Reduced gap */
  flex-shrink: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e0e0e0;
  text-decoration: none;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.3px;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.nav-link--cta {
  background: #16a34a;
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}

.nav-link--cta:hover {
  background: #15803d;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.3);
}

.welcome-text {
  color: #4ade80;
  font-weight: 700;
  font-size: 13px;
  margin-right: 12px;
}

.btn-logout {
  background: transparent;
  border: 1px solid rgba(255, 77, 79, 0.3);
  cursor: pointer;
  color: #ff4d4f;
}

.btn-logout:hover {
  background: rgba(255, 77, 79, 0.1);
  border-color: #ff4d4f;
}

/* Hamburger Styles */
.hamburger-btn {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 1001;
}

.hamburger-icon {
  width: 24px;
  height: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hamburger-icon.open span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
  transform: translateX(-20px);
}

.hamburger-icon.open span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Mobile Menu Overlay Styles */
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 26, 0.95);
  backdrop-filter: blur(10px);
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.mobile-menu-content {
  width: 100%;
  height: 100%;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
}

.mobile-menu-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  line-height: 1;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-nav-item {
  color: #fff;
  text-decoration: none;
  font-size: 20px;
  font-weight: 700;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
  text-align: left;
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #4ade80;
  padding-left: 24px;
}

.mobile-nav-item--cta {
  background: #16a34a;
  color: white;
  text-align: center;
  margin-top: 16px;
  box-shadow: 0 8px 24px rgba(22, 163, 74, 0.3);
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
}

.user-info-mobile {
  padding: 0 16px;
  margin-bottom: 8px;
}

.btn-logout-mobile {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

/* Search Dropdown Styles */
.client-search-overlay {
  position: fixed !important;
  top: 80px !important;
  left: 0 !important;
  width: 100% !important;
  background: white !important;
  padding: 32px 0 !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
  z-index: 9999 !important; /* Extremely high to be above everything */
  display: flex;
  justify-content: center;
  border-top: 1px solid #e2e8f0 !important;
  animation: slideDown 0.3s ease-out !important;
  opacity: 1 !important; /* Ensure it stays visible after animation */
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.search-bar-container {
  width: 100%;
  max-width: 1100px;
  padding: 0 24px;
}

.search-hint {
  font-size: 14px;
  font-weight: 700;
  color: #555;
  margin-bottom: 16px;
  text-align: left;
}

.search-inputs {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.search-field {
  flex: 1;
  height: 52px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  position: relative;
  transition: border-color 0.2s;
}

.search-field:focus-within {
  border-color: #1a1a2e;
}

.search-field__icon {
  padding: 0 14px;
  color: #999;
  display: flex;
  align-items: center;
}

.search-input--hidden {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  padding-right: 40px;
  appearance: none;
  cursor: pointer;
  outline: none;
}

.search-chevron {
  position: absolute;
  right: 14px;
  color: #999;
  pointer-events: none;
}

.search-text-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  background: transparent;
}

.search-text-input::placeholder {
  color: #999;
  font-weight: 400;
}

.search-locate-btn {
  background: transparent;
  border: none;
  padding: 0 14px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.search-locate-btn:hover {
  color: #16a34a;
}

.search-cta-btn {
  background: #1a1a2e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 24px;
  font-family: "Barlow Condensed", sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
}

.search-cta-btn:hover {
  background: #2a2a4e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 26, 46, 0.2);
}

.cta-accent {
  color: #4ade80;
  margin-right: 6px;
}

/* Dropdown Transition */
.search-dropdown-enter-active,
.search-dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-dropdown-enter-from,
.search-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Transitions */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Media Queries */
@media (max-width: 1440px) {
  .navbar-container { padding: 0 32px; }
  .navbar-left { gap: 20px; }
  .nav-menu { gap: 12px; }
}

@media (max-width: 1366px) {
  .navbar-container { padding: 0 24px; }
  .navbar-left { gap: 16px; }
  .nav-menu { gap: 10px; }
  .nav-menu-link { font-size: 12px; }
  .logo span { font-size: 19px; }
  .nav-link { padding: 8px 12px; }
  .nav-search-btn { padding: 8px 12px; }
}

@media (max-width: 1200px) {
  .navbar-container { padding: 0 20px; }
  .navbar-left { gap: 12px; }
  .nav-menu { gap: 8px; }
  .nav-menu-link { font-size: 12px; }
  .welcome-text { display: none; } /* Hide greeting when space is tight */
  .logo span { font-size: 18px; }
}

@media (max-width: 1024px) {
  .navbar-container { padding: 0 16px; }
  .nav-link { padding: 8px 12px; font-size: 11px; }
  .nav-menu-link { font-size: 11px; }
  .nav-search-btn span { display: none; } /* Optional: hide text only, keep icon */
}

@media (max-width: 900px) {
  .desktop-only {
    display: none !important;
  }
  
  .hamburger-btn {
    display: block;
  }
  
  .logo span {
    font-size: 20px;
  }
}

@media (max-width: 767px) {
  .search-overlay {
    top: 80px;
    padding: 16px 0;
  }
  .search-inputs {
    flex-direction: column;
    gap: 12px;
  }
  .search-cta-btn {
    width: 100%;
    height: 52px;
  }
  .search-hint {
    font-size: 13px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .logo span {
    font-size: 16px; /* Keep title but make it smaller on very small screens */
  }
  .navbar-container {
    padding: 0 16px;
  }
}
</style>
