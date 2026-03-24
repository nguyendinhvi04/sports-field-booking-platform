<template>
  <div class="auth-layout">
    <!-- Background slider -->
    <div class="auth-bg">
      <transition-group name="fade" tag="div" class="auth-slider">
        <div
          v-for="(banner, index) in banners"
          :key="banner"
          v-show="currentBannerIndex === index"
          class="auth-slide"
        >
          <img :src="banner" alt="Sports banner" class="auth-bg-img" />
        </div>
      </transition-group>
      <div class="auth-overlay"></div>
    </div>
    <header class="header">
      <ClientHeader></ClientHeader>
    </header>
    <!-- Content -->
    <div class="auth-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
// Import all banners
import banner1 from "../assets/assets/images/banner/banner1.jpg";
import banner2 from "../assets/assets/images/banner/banner2.jpg";
import banner3 from "../assets/assets/images/banner/banner3.jpg";
import banner4 from "../assets/assets/images/banner/banner4.jpg";
import banner5 from "../assets/assets/images/banner/banner5.jpg";
import banner6 from "../assets/assets/images/banner/banner6.jpg";
import banner7 from "../assets/assets/images/banner/banner7.jpg";
import banner8 from "../assets/assets/images/banner/banner8.jpg";
import banner9 from "../assets/assets/images/banner/banner9.jpg";

import "../assets/assets/js/bootstrap.bundle.min.js";
import "../assets/assets/js/jquery.min.js";
import "../assets/assets/plugins/simplebar/js/simplebar.min.js";
import "../assets/assets/plugins/metismenu/js/metisMenu.min.js";
import "../assets/assets/plugins/perfect-scrollbar/js/perfect-scrollbar.js";
import "../assets/assets/js/index.js";
import "../assets/assets/js/app.js";
import ClientHeader from "../components/layout/ClientHeader.vue";

export default {
  name: "AuthLayout",
  components: {
    ClientHeader,
  },
  data() {
    return {
      currentBannerIndex: 0,
      banners: [
        banner1,
        banner2,
        banner3,
        banner4,
        banner5,
        banner6,
        banner7,
        banner8,
        banner9,
      ],
      timer: null,
    };
  },
  mounted() {
    this.startSlider();
  },
  beforeUnmount() {
    this.stopSlider();
  },
  methods: {
    startSlider() {
      this.timer = setInterval(() => {
        this.nextSlide();
      }, 8000);
    },
    stopSlider() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    },
    nextSlide() {
      this.currentBannerIndex =
        (this.currentBannerIndex + 1) % this.banners.length;
    },
  },
};
</script>

<style>
@import "../assets/assets/plugins/simplebar/css/simplebar.css";
@import "../assets/assets/plugins/perfect-scrollbar/css/perfect-scrollbar.css";
@import "../assets/assets/css/bootstrap.min.css";
@import "../assets/assets/css/bootstrap-extended.css";
@import "../assets/assets/css/app.css";
@import "../assets/assets/css/icons.css";
@import "../assets/assets/css/dark-theme.css";
@import "../assets/assets/css/semi-dark.css";
@import "../assets/assets/css/header-colors.css";

.auth-layout {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.header {
  position: relative;
  z-index: 20;
  width: 100%;
}

.auth-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.auth-slider {
  position: relative;
  width: 100%;
  height: 100%;
}

.auth-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.auth-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  /* filter: blur(4px) brightness(0.6); */
  transform: scale(1.1);
}

.auth-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
  z-index: 1;
}

.auth-content {
  position: relative;
  z-index: 10;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Transition Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
