<template>
  <div class="hero-root">

    <!-- ════════════════════════════════════════
         HERO SECTION
         Desktop : full-viewport + left search card
         Mobile  : fixed-height image only
    ════════════════════════════════════════ -->
    <section class="hero" aria-label="Trang chủ tìm kiếm sân thể thao">

      <!-- Background slider -->
      <div class="hero__bg" aria-hidden="true">
        <transition-group name="crossfade" tag="div" class="hero__slider">
          <div
            v-for="(banner, index) in banners"
            :key="banner"
            v-show="currentBannerIndex === index"
            class="hero__slide"
          >
            <img
              :src="banner"
              alt=""
              class="hero__bg-img"
              :loading="index === 0 ? 'eager' : 'lazy'"
              width="1920" height="1080"
            />
          </div>
        </transition-group>
        <div class="hero__overlay" aria-hidden="true" />
      </div>

      <!-- Slide dots -->
      <div class="slide-dots" role="tablist" aria-label="Ảnh nền">
        <button
          v-for="(_, i) in banners"
          :key="i"
          class="slide-dot"
          :class="{ active: currentBannerIndex === i }"
          role="tab"
          :aria-selected="currentBannerIndex === i"
          :aria-label="`Ảnh ${i + 1}`"
          @click="goToSlide(i)"
        />
      </div>

      <!-- ✅ Desktop search card — UNCHANGED -->
      <div class="hero__desktop-card">
        <h1 class="dc-title">
          <span class="navy">TÌM KIẾM TRÒ</span><br/>
          <span class="navy">CHƠI </span><span class="navy">CỦA BẠN</span>
        </h1>
        <p class="dc-sub">Nền tảng đặt sân thể thao số 1 Việt Nam</p>

        <div class="dc-field dc-field--select">
          <div class="dc-field__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 3a14.5 14.5 0 0 0 0 18M12 3a14.5 14.5 0 0 1 0 18M3 12h18"/>
            </svg>
          </div>
          <select v-model="selectedSport" class="dc-field__select" aria-label="Chọn môn thể thao">
            <option v-for="s in sports" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <div class="dc-field__chevron" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div class="dc-field">
          <div class="dc-field__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.8" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <input
            v-model="location"
            type="text"
            placeholder="Nhập vị trí của bạn"
            class="dc-field__input"
            aria-label="Nhập địa điểm"
          />
          <button class="dc-locate" @click="useGPS" aria-label="Dùng vị trí hiện tại">
            <svg v-if="!loadingGPS" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            <span v-else class="gps-spin" aria-hidden="true" />
          </button>
        </div>

        <button class="dc-cta" @click="search">
          TÌM <span class="dc-cta__accent">ĐỊA ĐIỂM</span>
        </button>
      </div>

    </section>

    <div class="mobile-search">
      <h1 class="ms-title">
        <span class="dark">TÌM SÂN NHANH CHÓNG</span>
      </h1>
      <p class="ms-sub">Nền tảng đặt sân thể thao số 1 Việt Nam</p>

      <!-- Sport -->
      <div class="ms-field ms-field--select">
        <div class="ms-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 3a14.5 14.5 0 0 0 0 18M12 3a14.5 14.5 0 0 1 0 18M3 12h18"/>
          </svg>
        </div>
        <select v-model="selectedSport" class="ms-select" aria-label="Chọn môn thể thao">
          <option v-for="s in sports" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <div class="ms-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <!-- Location -->
      <div class="ms-field">
        <div class="ms-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.8" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <input
          v-model="location"
          type="text"
          placeholder="Nhập vị trí của bạn"
          class="ms-input"
          aria-label="Nhập địa điểm"
          autocomplete="off"
        />
        <button
          class="ms-locate"
          @click="useGPS"
          :class="{ loading: loadingGPS }"
          aria-label="Dùng vị trí hiện tại"
        >
          <svg v-if="!loadingGPS" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <span v-else class="gps-spin" aria-hidden="true" />
        </button>
      </div>

      <!-- CTA -->
      <button class="ms-cta" @click="search">
        <span class="ms-cta-find">TÌM </span>ĐỊA ĐIỂM
      </button>
    </div>

    <!-- ════════════════════════════════════════
         DESKTOP feature bar — UNCHANGED
    ════════════════════════════════════════ -->
    <nav class="feature-bar" aria-label="Tính năng chính">
      <router-link to="/booking" class="feature-item">
        <div class="feature-item__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <div class="feature-item__text">
          <span class="feature-item__label">Tìm các cơ sở thể thao</span>
          <span class="feature-item__sub">Chơi trò chơi của bạn</span>
        </div>
        <svg class="feature-item__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </router-link>

      <div class="feature-divider" aria-hidden="true" />

      <router-link to="/booking" class="feature-item">
        <div class="feature-item__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
          </svg>
        </div>
        <div class="feature-item__text">
          <span class="feature-item__label">Đặt chỗ trực tuyến hoặc liên hệ để biết thêm chi tiết.</span>
        </div>
        <svg class="feature-item__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </router-link>

      <div class="feature-divider" aria-hidden="true" />

      <router-link to="/promotions" class="feature-item feature-item--icon-only">
        <div class="feature-item__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
      </router-link>
    </nav>

    <!-- ════════════════════════════════════════
         MOBILE ONLY — bottom tab bar
         Matches screenshot: search icon › calendar icon › runner icon
    ════════════════════════════════════════ -->
    <nav class="mobile-tab-bar" aria-label="Điều hướng">
      <router-link to="/booking" class="tab-item tab-item--active" aria-label="Tìm kiếm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </router-link>

      <span class="tab-sep" aria-hidden="true">›</span>

      <router-link to="/booking" class="tab-item" aria-label="Đặt sân">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
        </svg>
      </router-link>

      <span class="tab-sep" aria-hidden="true">›</span>

      <router-link to="/play" class="tab-item" aria-label="Thi đấu">
        <!-- Running person icon matching screenshot -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="14" cy="4" r="2"/>
          <path d="M10.5 8.5L8 19"/>
          <path d="M14.5 8.5L17 13l-3 2"/>
          <path d="M10.5 8.5L7 11l2 2"/>
          <path d="M8 19l3-2 1 3"/>
        </svg>
      </router-link>
    </nav>

  </div>
</template>

<script>
import banner1 from "../../../assets/assets/images/banner/banner1.jpg";
import banner2 from "../../../assets/assets/images/banner/banner2.jpg";
import banner3 from "../../../assets/assets/images/banner/banner3.jpg";
import banner4 from "../../../assets/assets/images/banner/banner4.jpg";
import banner5 from "../../../assets/assets/images/banner/banner5.jpg";
import banner6 from "../../../assets/assets/images/banner/banner6.jpg";
import banner7 from "../../../assets/assets/images/banner/banner7.jpg";
import banner8 from "../../../assets/assets/images/banner/banner8.jpg";
import banner9 from "../../../assets/assets/images/banner/banner9.jpg";

export default {
  name: "HeroView",

  data() {
    return {
      selectedSport: "Cầu lông",
      location: "Đà Nẵng",
      currentBannerIndex: 0,
      loadingGPS: false,
      timer: null,

      banners: [banner1, banner2, banner3, banner4, banner5, banner6, banner7, banner8, banner9],

      sports: [
        { value: "badminton",  label: "Cầu lông" },
        { value: "football",   label: "Bóng đá" },
        { value: "tennis",     label: "Tennis" },
        { value: "basketball", label: "Bóng rổ" },
        { value: "pickleball", label: "Pickleball" },
        { value: "volleyball", label: "Bóng chuyền" },
        { value: "squash",     label: "Squash" },
        { value: "cricket",    label: "Cricket" },
      ],
    };
  },

  mounted() {
    this.timer = setInterval(this.nextSlide, 5000);
  },

  beforeUnmount() {
    clearInterval(this.timer);
  },

  methods: {
    nextSlide() {
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
    },
    goToSlide(i) {
      this.currentBannerIndex = i;
      clearInterval(this.timer);
      this.timer = setInterval(this.nextSlide, 5000);
    },

    async useGPS() {
      if (!navigator.geolocation) return;
      this.loadingGPS = true;
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude: lat, longitude: lng } }) => {
          try {
            const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            this.location = data.address?.suburb || data.address?.city || data.address?.town || "Vị trí hiện tại";
          } catch {
            this.location = "Vị trí hiện tại";
          } finally {
            this.loadingGPS = false;
          }
        },
        () => { this.loadingGPS = false; },
        { timeout: 8000 }
      );
    },

    search() {
      if (!this.location.trim()) return;
      this.$router.push({
        path: `/booking`,
        query: { city: this.location, sport: this.selectedSport },
      }).catch(() => {});
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800;900&display=swap");

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.hero-root {
  font-family: "Barlow", sans-serif;
  font-size: 14px;
  color: #333;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.green { color: #16a34a; }
.navy  { color: #1e2a4a; }
.dark  { color: #1e2a4a; }

/* ─── GPS spinner ─── */
.gps-spin {
  display: block; width: 14px; height: 14px;
  border-radius: 50%; border: 2px solid #e5e7eb;
  border-top-color: #16a34a; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ════════════════════════════════════════
   HERO — Desktop full viewport
════════════════════════════════════════ */
.hero {
  position: relative;
  width: 100%;
  height: calc(100vh - 80px);
  min-height: 560px;
  display: flex; align-items: center;
  overflow: hidden;
}

.hero__bg    { position: absolute; inset: 0; z-index: 0; }
.hero__slider{ position: relative; width: 100%; height: 100%; }
.hero__slide { position: absolute; inset: 0; }
.hero__bg-img{
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  display: block; filter: brightness(0.82);
}
.hero__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.2) 60%, transparent 100%);
}

.crossfade-enter-active,.crossfade-leave-active{ transition: opacity 1.2s ease; }
.crossfade-enter-from,.crossfade-leave-to{ opacity: 0; }

.slide-dots {
  position: absolute; bottom: 20px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 7px; z-index: 10;
}
.slide-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255,255,255,.45); border: none;
  cursor: pointer; padding: 0;
  transition: background .25s, transform .25s;
}
.slide-dot.active { background: #fff; transform: scale(1.3); }

/* ── Desktop card ── */
.hero__desktop-card {
  position: relative; z-index: 10;
  background: #fff; border-radius: 4px;
  padding: 32px 32px 28px;
  margin-left: 7%; width: 390px;
  box-shadow: 0 8px 40px rgba(0,0,0,.18);
}

.dc-title {
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 900; font-size: 52px;
  line-height: 1; margin-bottom: 10px; letter-spacing: 0.5px;
}
.dc-sub { font-size: 14px; color: #555; margin-bottom: 22px; }

.dc-field {
  display: flex; align-items: center;
  border: 1.5px solid #d1d5db; border-radius: 4px;
  background: #fff; margin-bottom: 12px; overflow: hidden;
  transition: border-color .2s;
}
.dc-field:focus-within { border-color: #16a34a; }
.dc-field__icon { padding: 0 10px 0 12px; display: flex; align-items: center; flex-shrink: 0; }
.dc-field--select { position: relative; }
.dc-field__select {
  flex: 1; border: none; outline: none;
  font-family: "Barlow", sans-serif; font-size: 14.5px; font-weight: 500;
  color: #333; background: transparent; padding: 13px 0;
  cursor: pointer; appearance: none;
}
.dc-field__chevron { padding: 0 12px; display: flex; align-items: center; pointer-events: none; }
.dc-field__input {
  flex: 1; border: none; outline: none;
  font-family: "Barlow", sans-serif; font-size: 14.5px; font-weight: 500;
  color: #333; background: transparent; padding: 13px 0;
}
.dc-field__input::placeholder { color: #aaa; font-weight: 400; }
.dc-locate {
  padding: 0 12px; background: none; border: none;
  cursor: pointer; display: flex; align-items: center;
  opacity: .6; transition: opacity .2s;
}
.dc-locate:hover { opacity: 1; }
.dc-cta {
  width: 100%; background: #1e2a4a; color: #fff; border: none;
  border-radius: 4px; padding: 15px;
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 800; font-size: 16px; letter-spacing: 2px;
  cursor: pointer; margin-top: 4px;
  transition: background .2s, transform .1s;
}
.dc-cta:hover { background: #162039; }
.dc-cta:active { transform: scale(.99); }
.dc-cta__accent { color: #4ade80; }

/* ════════════════════════════════════════
   MOBILE SEARCH CARD — hidden on desktop
════════════════════════════════════════ */
.mobile-search { display: none; }

/* ════════════════════════════════════════
   DESKTOP FEATURE BAR
════════════════════════════════════════ */
.feature-bar {
  background: #1e2a4a;
  display: flex; align-items: stretch;
  min-height: 72px; flex-shrink: 0;
}
.feature-item {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 32px; color: #fff;
  text-decoration: none; flex: 1;
  transition: background .2s;
}
.feature-item:hover { background: rgba(255,255,255,.07); }
.feature-item--icon-only { flex: 0 0 80px; justify-content: center; }
.feature-item__icon { color: #4ade80; flex-shrink: 0; display: flex; align-items: center; }
.feature-item__icon svg { width: 22px; height: 22px; }
.feature-item__text { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.feature-item__label { font-size: 13.5px; font-weight: 700; color: #fff; line-height: 1.4; }
.feature-item__sub   { font-size: 12px; color: rgba(255,255,255,.7); transition: color .2s; }
.feature-item:hover .feature-item__sub { color: #4ade80; text-decoration: underline; }
.feature-item__arrow { width: 16px; height: 16px; color: rgba(255,255,255,.5); flex-shrink: 0; }
.feature-divider { width: 1px; background: rgba(255,255,255,.12); margin: 12px 0; }

/* ════════════════════════════════════════
   MOBILE TAB BAR — hidden on desktop
════════════════════════════════════════ */
.mobile-tab-bar { display: none; }

/* ════════════════════════════════════════
   RESPONSIVE — Mobile ≤ 767px
════════════════════════════════════════ */
@media (max-width: 767px) {

  /* ── Hero-root: Fill remaining viewport on mobile ── */
  .hero-root {
    min-height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
  }

  /* ── Hero: Larger image height ── */
  .hero {
    height: 40vh;       /* Increased from fixed 56vw */
    min-height: 240px;
    max-height: none;   /* Removed max-height limit */
    align-items: flex-start;
  }
  .hero__overlay  { opacity: 0.15; } /* Slight darkening for better contrast on mobile if text overlaps */
  .slide-dots     { bottom: 12px; }
  .hero__desktop-card { display: none; }

  /* ── Mobile search card ── */
  .mobile-search {
    display: flex; flex-direction: column;
    padding: 24px 20px;
    background: var(--bg);
    flex: 1; /* Occupy remaining space in hero-root */
    justify-content: center; /* Center content vertically if space permits */
  }

  .ms-title {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 900; font-size: 36px;
    line-height: 1.1; margin-bottom: 5px;
  }
  .ms-sub {
    font-size: 13px; color: #555;
    margin-bottom: 18px; line-height: 1.4;
  }

  .ms-field {
    display: flex; align-items: center;
    border: 1.5px solid #d1d5db; border-radius: 6px;
    background: #fff; margin-bottom: 11px; overflow: hidden;
    transition: border-color .2s;
  }
  .ms-field:focus-within { border-color: #16a34a; }
  .ms-field--select { position: relative; }

  .ms-icon { padding: 0 10px 0 13px; display: flex; align-items: center; flex-shrink: 0; }
  .ms-icon svg { width: 17px; height: 17px; }

  .ms-select {
    flex: 1; border: none; outline: none;
    font-family: "Barlow", sans-serif; font-size: 15px; font-weight: 500;
    color: #333; background: transparent; padding: 14px 0;
    cursor: pointer; appearance: none;
  }
  .ms-chevron { padding: 0 12px; display: flex; align-items: center; pointer-events: none; }
  .ms-chevron svg { width: 13px; height: 13px; }

  .ms-input {
    flex: 1; border: none; outline: none;
    font-family: "Barlow", sans-serif; font-size: 15px; font-weight: 500;
    color: #333; background: transparent; padding: 14px 0;
  }
  .ms-input::placeholder { color: #aaa; font-weight: 400; }

  .ms-locate {
    padding: 0 12px; background: none; border: none;
    cursor: pointer; display: flex; align-items: center;
    opacity: .55; transition: opacity .2s;
  }
  .ms-locate:hover,.ms-locate.loading { opacity: 1; }
  .ms-locate svg { width: 15px; height: 15px; }

  .ms-cta {
    width: 100%; background: #1e2a4a; color: #fff; border: none;
    border-radius: 6px; padding: 15px;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 800; font-size: 16px; letter-spacing: 2px;
    cursor: pointer; margin-top: 2px;
    transition: background .2s, transform .1s;
  }
  .ms-cta:active { transform: scale(.98); }
  .ms-cta-find { color: #4ade80; }

  /* ── Hide desktop feature bar ── */
  .feature-bar { display: none; }

  /* ── Mobile bottom tab bar ── */
  .mobile-tab-bar {
    display: flex; align-items: center; justify-content: space-around;
    background: #1e2a4a;
    padding: 12px 20px;
    flex-shrink: 0;
  }

  .tab-item {
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,.5);
    text-decoration: none; flex: 1; padding: 6px 0;
    transition: color .2s;
  }
  .tab-item svg { width: 27px; height: 27px; }
  .tab-item:hover { color: rgba(255,255,255,.85); }

  /* Active = green, matching screenshot */
  .tab-item--active { color: #4ade80; }

  /* Separator › chevrons between tabs */
  .tab-sep {
    color: rgba(255,255,255,.2);
    font-size: 20px; font-weight: 300;
    user-select: none; line-height: 1;
  }
}

/* Very small phones */
@media (max-width: 375px) {
  .ms-title { font-size: 30px; }
}
</style>