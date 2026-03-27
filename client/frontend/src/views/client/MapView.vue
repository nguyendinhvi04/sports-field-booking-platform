<template>
  <div class="map-page">
    <!-- ── Sidebar ── -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="sidebar-title-row">
          <h1 class="sidebar-title">
            <svg viewBox="0 0 24 24" class="title-icon" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Tìm sân gần bạn
          </h1>
          <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed" :aria-label="sidebarCollapsed ? 'Mở thanh bên' : 'Thu gọn thanh bên'">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Search Box -->
        <div class="search-row" v-show="!sidebarCollapsed">
          <div class="search-input-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="map-search-input"
              v-model="searchQuery"
              type="search"
              placeholder="Tên sân, địa chỉ..."
              class="search-input"
              @input="onSearchInput"
              aria-label="Tìm kiếm sân"
            />
          </div>
          <button class="btn-locate" @click="locateUser" title="Định vị vị trí của tôi" aria-label="Định vị vị trí của tôi">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              <circle cx="12" cy="12" r="8" stroke-dasharray="none" fill="none"/>
            </svg>
          </button>
        </div>

        <!-- Filters -->
        <div class="filters-row" v-show="!sidebarCollapsed">
          <button
            v-for="sport in sports"
            :key="sport.value"
            class="filter-chip"
            :class="{ active: selectedSport === sport.value }"
            @click="toggleSport(sport.value)"
            :aria-pressed="selectedSport === sport.value"
          >
            <span class="chip-icon">{{ sport.emoji }}</span>
            {{ sport.label }}
          </button>
        </div>
      </div>

      <!-- Results -->
      <div class="sidebar-results" v-show="!sidebarCollapsed">
        <!-- Count -->
        <div class="result-count" aria-live="polite">
          <span v-if="loading" class="loading-text">
            <span class="spinner-inline"></span> Đang tải...
          </span>
          <span v-else>
            <strong>{{ filteredClubs.length }}</strong> sân được tìm thấy
            <span v-if="userLocation"> gần bạn</span>
          </span>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="clubs-list">
          <div v-for="n in 4" :key="n" class="club-card skeleton-card">
            <div class="skeleton-img"></div>
            <div class="club-card-body">
              <div class="skeleton-line w80"></div>
              <div class="skeleton-line w55"></div>
              <div class="skeleton-line w40"></div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredClubs.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p>Không tìm thấy sân phù hợp</p>
          <button class="btn-reset" @click="resetFilters">Xóa bộ lọc</button>
        </div>

        <!-- Club List -->
        <div v-else class="clubs-list">
          <div
            v-for="club in filteredClubs"
            :key="club.id"
            class="club-card"
            :class="{ 'club-card--active': selectedClub?.id === club.id }"
            @click="selectClub(club)"
            role="button"
            tabindex="0"
            :aria-label="`Chọn sân ${club.name}`"
            @keydown.enter="selectClub(club)"
          >
            <div class="club-card-img-wrap">
              <img
                :src="club.coverImageUrl || club.logoUrl || defaultImg"
                :alt="`Sân ${club.name}`"
                class="club-card-img"
                loading="lazy"
              />
              <span class="distance-badge" v-if="club.distance != null">
                {{ formatDist(club.distance) }}
              </span>
            </div>
            <div class="club-card-body">
              <h3 class="club-name">{{ club.name }}</h3>
              <p class="club-address">
                <svg viewBox="0 0 24 24" aria-hidden="true" class="addr-icon">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ club.district }}, {{ club.city }}
              </p>
              <div class="club-sports">
                <span
                  v-for="sport in getSportTypes(club)"
                  :key="sport"
                  class="sport-tag"
                >{{ sport }}</span>
              </div>
              <div class="club-footer">
                <span class="min-price" v-if="club.minPrice">
                  từ {{ formatPrice(club.minPrice) }}/h
                </span>
                <router-link
                  :to="`/venue/${club.slug}`"
                  class="btn-book"
                  @click.stop
                >
                  Đặt sân
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── Map Container ── -->
    <div class="map-container">
      <div id="mapbox-map" ref="mapEl" class="mapbox-map" aria-label="Bản đồ sân thể thao"></div>

      <!-- Map Controls Overlay -->
      <div class="map-controls-overlay">
        <button class="map-ctrl-btn" @click="zoomIn" aria-label="Phóng to">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button class="map-ctrl-btn" @click="zoomOut" aria-label="Thu nhỏ">
          <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button class="map-ctrl-btn" @click="resetView" aria-label="Về vị trí mặc định" title="Về Hồ Chí Minh">
          <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
      </div>

      <!-- Selected Club Popup (mobile) -->
      <Transition name="slide-up">
        <div v-if="selectedClub && isMobile" class="mobile-popup">
          <button class="popup-close" @click="selectedClub = null" aria-label="Đóng">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="popup-inner">
            <img
              :src="selectedClub.coverImageUrl || selectedClub.logoUrl || defaultImg"
              :alt="selectedClub.name"
              class="popup-img"
            />
            <div class="popup-info">
              <h3 class="popup-name">{{ selectedClub.name }}</h3>
              <p class="popup-addr">{{ selectedClub.address }}, {{ selectedClub.district }}</p>
              <div class="popup-footer">
                <span class="min-price" v-if="selectedClub.minPrice">từ {{ formatPrice(selectedClub.minPrice) }}/h</span>
                <router-link :to="`/venue/${selectedClub.slug}`" class="btn-book btn-book--sm">Đặt sân →</router-link>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { clubService } from '@/services/club.service.js';

const DEFAULT_CENTER = [106.6297, 10.8231]; // HCM
const DEFAULT_ZOOM = 12;

const SPORT_LABELS = {
  FOOTBALL:   { label: 'Bóng đá',   emoji: '⚽' },
  BADMINTON:  { label: 'Cầu lông',  emoji: '🏸' },
  TENNIS:     { label: 'Tennis',    emoji: '🎾' },
  PICKLEBALL: { label: 'Pickleball',emoji: '🏓' },
  BASKETBALL: { label: 'Bóng rổ',   emoji: '🏀' },
  VOLLEYBALL: { label: 'Bóng chuyền',emoji: '🏐' },
  OTHER:      { label: 'Khác',       emoji: '🎯' },
};

export default {
  name: 'MapView',

  data() {
    return {
      map: null,
      markers: [],
      userMarker: null,
      clubs: [],
      selectedClub: null,
      searchQuery: '',
      selectedSport: null,
      loading: true,
      error: null,
      userLocation: null,
      sidebarCollapsed: false,
      isMobile: window.innerWidth < 768,
      popups: {},
      defaultImg: 'https://images.unsplash.com/photo-1544691371-464a4d46af63?w=600&q=80',
      sports: Object.entries(SPORT_LABELS).map(([value, info]) => ({ value, ...info })),
    };
  },

  computed: {
    filteredClubs() {
      let list = [...this.clubs];

      // Lọc theo môn thể thao
      if (this.selectedSport) {
        list = list.filter(club =>
          club.courts?.some(c => c.sportType === this.selectedSport)
        );
      }

      // Lọc theo tìm kiếm
      const q = this.searchQuery.trim().toLowerCase();
      if (q) {
        list = list.filter(club =>
          club.name.toLowerCase().includes(q) ||
          club.address?.toLowerCase().includes(q) ||
          club.district?.toLowerCase().includes(q) ||
          club.city?.toLowerCase().includes(q)
        );
      }

      return list;
    },
  },

  async mounted() {
    document.title = 'Bản đồ sân thể thao | PlayFinder';
    window.addEventListener('resize', this.onResize);
    this.initMap();
    await this.loadClubs();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
    if (this.map) this.map.remove();
  },

  watch: {
    filteredClubs(newList) {
      this.renderMarkers(newList);
    },
  },

  methods: {
    // ── Init Mapbox map ──
    initMap() {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token || token === 'your_mapbox_token_here') {
        this.error = 'Thiếu VITE_MAPBOX_TOKEN trong file .env của frontend';
        this.loading = false;
        return;
      }

      mapboxgl.accessToken = token;

      this.map = new mapboxgl.Map({
        container: this.$refs.mapEl,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
        language: 'vi',
      });

      this.map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

      // Smooth load animation
      this.map.on('load', () => {
        this.$refs.mapEl?.classList.add('map-loaded');
      });
    },

    // ── Load clubs (all approved clubs) ──
    async loadClubs() {
      this.loading = true;
      try {
        // Dùng searchClubs với limit lớn để lấy tất cả sân có toạ độ
        const res = await clubService.searchVenues({ limit: 100 });
        this.clubs = (res.data?.data || []);
        this.renderMarkers(this.filteredClubs);
      } catch (e) {
        console.error('Map load clubs error:', e);
        // Fallback: dùng nearby tại HCM
        try {
          const res2 = await clubService.getNearbyClubs(DEFAULT_CENTER[1], DEFAULT_CENTER[0], 50);
          this.clubs = res2.data?.data || [];
          this.renderMarkers(this.filteredClubs);
        } catch {
          this.error = 'Không thể tải danh sách sân. Vui lòng thử lại.';
        }
      } finally {
        this.loading = false;
      }
    },

    // ── Render markers on map ──
    renderMarkers(clubs) {
      if (!this.map) return;

      // Xóa markers cũ
      this.markers.forEach(m => m.remove());
      this.markers = [];
      Object.values(this.popups).forEach(p => p.remove());
      this.popups = {};

      clubs.forEach(club => {
        const lat = club.latitude;
        const lng = club.longitude;
        if (!lat || !lng) return;

        // Custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Sân ${club.name}`);
        el.innerHTML = `
          <div class="marker-pin ${this.selectedClub?.id === club.id ? 'marker-pin--active' : ''}">
            <span class="marker-emoji">${this.getMainSportEmoji(club)}</span>
          </div>
          <div class="marker-shadow"></div>
        `;

        // Popup
        const sports = this.getSportTypes(club);
        const priceStr = club.minPrice ? `Từ ${this.formatPrice(club.minPrice)}/h` : 'Liên hệ';
        const imgSrc = club.coverImageUrl || club.logoUrl || this.defaultImg;

        const popup = new mapboxgl.Popup({
          offset: 12,
          closeButton: false,
          maxWidth: '260px',
          className: 'map-popup',
        }).setHTML(`
          <div class="map-popup-inner">
            <img src="${imgSrc}" alt="${club.name}" class="map-popup-img" onerror="this.src='${this.defaultImg}'" />
            <div class="map-popup-content">
              <h4 class="map-popup-name">${club.name}</h4>
              <p class="map-popup-addr">${club.district || ''}, ${club.city || ''}</p>
              <div class="map-popup-sports">${sports.map(s => `<span class="map-sport-tag">${s}</span>`).join('')}</div>
              <div class="map-popup-footer">
                <span class="map-popup-price">${priceStr}</span>
                <a href="/venue/${club.slug}" class="map-popup-btn" onclick="return false;" data-slug="${club.slug}">Đặt sân</a>
              </div>
            </div>
          </div>
        `);

        this.popups[club.id] = popup;

        // Gắn click vào nút "Đặt sân" trong popup
        popup.on('open', () => {
          const btn = document.querySelector(`.map-popup [data-slug="${club.slug}"]`);
          if (btn) {
            btn.addEventListener('click', () => {
              this.$router.push(`/venue/${club.slug}`);
            });
          }
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(this.map);

        // Click handler
        el.addEventListener('click', () => {
          this.selectClub(club, false);
        });

        this.markers.push(marker);
      });
    },

    // ── Select club ──
    selectClub(club, flyTo = true) {
      this.selectedClub = club;

      // Update active marker style
      document.querySelectorAll('.marker-pin').forEach(el => {
        el.classList.remove('marker-pin--active');
      });

      // Fly to club location
      if (flyTo && club.latitude && club.longitude && this.map) {
        this.map.flyTo({
          center: [club.longitude, club.latitude],
          zoom: 15,
          duration: 800,
          essential: true,
        });

        // Open popup
        const popup = this.popups[club.id];
        if (popup && !popup.isOpen()) {
          popup.addTo(this.map);
        }
      }

      // Scroll sidebar card into view (desktop)
      if (!this.isMobile) {
        this.$nextTick(() => {
          const card = this.$el.querySelector(`.club-card--active`);
          card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    },

    // ── Locate user ──
    locateUser() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          this.userLocation = { lat: latitude, lng: longitude };

          // Move user marker
          if (this.userMarker) this.userMarker.remove();
          const el = document.createElement('div');
          el.className = 'user-marker';
          el.innerHTML = `<div class="user-pulse"></div><div class="user-dot"></div>`;
          this.userMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
            .setLngLat([longitude, latitude])
            .addTo(this.map);

          this.map.flyTo({ center: [longitude, latitude], zoom: 13, duration: 1000 });

          // Load nearby clubs
          this.loadNearbyClubs(latitude, longitude);
        },
        err => alert(`Không thể lấy vị trí: ${err.message}`)
      );
    },

    async loadNearbyClubs(lat, lng) {
      this.loading = true;
      try {
        const res = await clubService.getNearbyClubs(lat, lng, 20);
        this.clubs = res.data?.data || [];
        this.renderMarkers(this.filteredClubs);
      } catch {
        // silent
      } finally {
        this.loading = false;
      }
    },

    // ── Filter helpers ──
    toggleSport(sport) {
      this.selectedSport = this.selectedSport === sport ? null : sport;
    },

    onSearchInput() {
      // Computed `filteredClubs` auto triggers re-render via watch
    },

    resetFilters() {
      this.searchQuery = '';
      this.selectedSport = null;
    },

    // ── Map controls ──
    zoomIn()   { this.map?.zoomIn(); },
    zoomOut()  { this.map?.zoomOut(); },
    resetView() {
      this.map?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 800 });
    },

    // ── Utils ──
    getSportTypes(club) {
      const types = [...new Set((club.courts || []).map(c => c.sportType))];
      return types.map(t => SPORT_LABELS[t]?.label || t);
    },

    getMainSportEmoji(club) {
      const type = club.courts?.[0]?.sportType;
      return SPORT_LABELS[type]?.emoji || '📍';
    },

    formatDist(d) {
      const km = parseFloat(d);
      return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
    },

    formatPrice(p) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(p);
    },

    onResize() {
      this.isMobile = window.innerWidth < 768;
    },
  },
};
</script>

<style>
/* ── Mapbox Popup custom styles (global, không scoped) ── */
.mapboxgl-popup-content {
  padding: 0 !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
  border: none !important;
}

.map-popup-inner {
  display: flex;
  flex-direction: column;
  width: 240px;
}

.map-popup-img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}

.map-popup-content {
  padding: 12px 14px 14px;
}

.map-popup-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 3px;
  line-height: 1.3;
}

.map-popup-addr {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 8px;
}

.map-popup-sports {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.map-sport-tag {
  background: #f0fdf4;
  color: #15803d;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 99px;
  border: 1px solid #bbf7d0;
}

.map-popup-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.map-popup-price {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
}

.map-popup-btn {
  background: linear-gradient(135deg, #3dd56d, #22c55e);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
  outline: none;
}

.map-popup-btn:hover { opacity: 0.85; }

/* Custom marker */
.custom-marker { cursor: pointer; }

.marker-pin {
  width: 40px;
  height: 40px;
  border-radius: 50% 50% 50% 0;
  background: linear-gradient(135deg, #3dd56d, #22c55e);
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(61, 213, 109, 0.4);
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  position: relative;
  z-index: 1;
}

.marker-pin:hover,
.marker-pin--active {
  background: linear-gradient(135deg, #1a56db, #2563eb);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
  transform: rotate(-45deg) scale(1.15);
}

.marker-emoji {
  transform: rotate(45deg);
  font-size: 1rem;
  line-height: 1;
}

.marker-shadow {
  width: 20px;
  height: 6px;
  background: rgba(0,0,0,0.15);
  border-radius: 50%;
  margin: 0 auto;
  margin-top: 1px;
}

/* User position marker */
.user-marker { position: relative; width: 20px; height: 20px; }
.user-dot {
  width: 14px; height: 14px;
  background: #2563eb;
  border: 3px solid #fff;
  border-radius: 50%;
  position: absolute;
  top: 3px; left: 3px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(37,99,235,0.5);
}
.user-pulse {
  width: 36px; height: 36px;
  background: rgba(37,99,235,0.2);
  border-radius: 50%;
  position: absolute;
  top: -8px; left: -8px;
  animation: pulse-ring 2s infinite;
}
@keyframes pulse-ring {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}
</style>

<style scoped>
/* ── Layout ── */
.map-page {
  display: flex;
  height: calc(100vh - 70px);
  overflow: hidden;
  font-family: 'Inter', -apple-system, sans-serif;
}

/* ── Sidebar ── */
.sidebar {
  width: 360px;
  min-width: 360px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  z-index: 10;
  transition: width 0.3s ease, min-width 0.3s ease;
  overflow: hidden;
}

.sidebar-collapsed {
  width: 60px;
  min-width: 60px;
}

.sidebar-header {
  padding: 20px 16px 0;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.sidebar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.sidebar-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
}

.title-icon {
  width: 20px; height: 20px;
  stroke: #3dd56d;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

.sidebar-toggle {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  width: 34px; height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.sidebar-toggle svg {
  width: 16px; height: 16px;
  stroke: #6b7280;
  stroke-width: 2;
  fill: none;
}
.sidebar-toggle:hover { background: #f9fafb; }

/* Search row */
.search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.search-input-wrap {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px; top: 50%; transform: translateY(-50%);
  width: 15px; height: 15px;
  stroke: #9ca3af;
  stroke-width: 2;
  fill: none;
}

.search-input {
  width: 100%;
  padding: 9px 10px 9px 32px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.83rem;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.search-input:focus {
  border-color: #3dd56d;
  box-shadow: 0 0 0 3px rgba(61,213,109,0.12);
}

.btn-locate {
  background: linear-gradient(135deg, #3dd56d, #22c55e);
  border: none;
  border-radius: 10px;
  width: 40px; height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s, transform 0.2s;
}
.btn-locate svg {
  width: 16px; height: 16px;
  stroke: #fff;
  stroke-width: 2;
  fill: none;
}
.btn-locate:hover { opacity: 0.85; transform: scale(1.05); }

/* Filters */
.filters-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  overflow-x: auto;
  scrollbar-width: none;
}
.filters-row::-webkit-scrollbar { display: none; }

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border: 1.5px solid #e5e7eb;
  border-radius: 99px;
  background: #fff;
  color: #374151;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.filter-chip:hover {
  border-color: #3dd56d;
  color: #16a34a;
}
.filter-chip.active {
  background: linear-gradient(135deg, #3dd56d, #22c55e);
  border-color: transparent;
  color: #fff;
}
.chip-icon { font-size: 0.85em; }

/* Results area */
.sidebar-results {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 20px;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
.sidebar-results::-webkit-scrollbar { width: 4px; }
.sidebar-results::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.result-count {
  font-size: 0.78rem;
  color: #6b7280;
  margin-bottom: 12px;
}
.result-count strong { color: #1a1a2e; }
.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}
.spinner-inline {
  width: 14px; height: 14px;
  border: 2px solid #e5e7eb;
  border-top-color: #3dd56d;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  color: #9ca3af;
  text-align: center;
}
.empty-state svg {
  width: 40px; height: 40px;
  stroke: #d1d5db;
  stroke-width: 1.5;
  fill: none;
}
.empty-state p { font-size: 0.85rem; margin: 0; }
.btn-reset {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 0.78rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reset:hover { border-color: #3dd56d; color: #16a34a; }

/* Club List */
.clubs-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.club-card {
  display: flex;
  gap: 12px;
  border: 1.5px solid #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  background: #fff;
}
.club-card:hover,
.club-card--active {
  border-color: #3dd56d;
  box-shadow: 0 4px 16px rgba(61,213,109,0.15);
  transform: translateY(-1px);
}
.club-card--active { background: #f0fdf4; }

.club-card-img-wrap {
  position: relative;
  flex-shrink: 0;
  width: 90px;
}
.club-card-img {
  width: 90px;
  height: 100%;
  object-fit: cover;
  display: block;
  min-height: 90px;
}

.distance-badge {
  position: absolute;
  top: 6px; left: 6px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 99px;
  backdrop-filter: blur(4px);
}

.club-card-body {
  flex: 1;
  padding: 10px 10px 10px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.club-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.club-address {
  font-size: 0.72rem;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.addr-icon {
  width: 11px; height: 11px;
  stroke: #9ca3af;
  stroke-width: 2;
  fill: none;
  flex-shrink: 0;
}

.club-sports {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.sport-tag {
  background: #f0fdf4;
  color: #15803d;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 99px;
  border: 1px solid #bbf7d0;
}

.club-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.min-price {
  font-size: 0.73rem;
  color: #16a34a;
  font-weight: 700;
}

.btn-book {
  background: linear-gradient(135deg, #3dd56d, #22c55e);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  text-decoration: none;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.btn-book:hover { opacity: 0.85; }
.btn-book--sm { font-size: 0.75rem; padding: 6px 14px; }

/* Skeleton */
.skeleton-card { pointer-events: none; }
.skeleton-img {
  width: 90px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  min-height: 90px;
}
.skeleton-line {
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
.w80 { width: 80%; }
.w55 { width: 55%; }
.w40 { width: 40%; }
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ── Map container ── */
.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.mapbox-map {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.mapbox-map.map-loaded { opacity: 1; }

/* Map custom controls */
.map-controls-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 5;
}

.map-ctrl-btn {
  width: 36px; height: 36px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: background 0.2s, transform 0.2s;
}
.map-ctrl-btn svg {
  width: 16px; height: 16px;
  stroke: #374151;
  stroke-width: 2;
  fill: none;
}
.map-ctrl-btn:hover {
  background: #f9fafb;
  transform: scale(1.05);
}

/* Mobile popup */
.mobile-popup {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
  z-index: 20;
  padding: 16px;
}

.popup-close {
  position: absolute;
  top: 12px; right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.popup-close svg {
  width: 18px; height: 18px;
  stroke: #6b7280;
  stroke-width: 2;
  fill: none;
}

.popup-inner {
  display: flex;
  gap: 14px;
}
.popup-img {
  width: 80px; height: 80px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
}
.popup-info { flex: 1; }
.popup-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
}
.popup-addr {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 10px;
}
.popup-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .map-page { flex-direction: column; height: 100svh; }
  .sidebar {
    width: 100% !important;
    min-width: 100% !important;
    height: auto;
    max-height: 45vh;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  .sidebar-collapsed { max-height: 60px; }
  .map-container { flex: 1; }
  .map-controls-overlay { top: 10px; right: 10px; }
}
</style>
