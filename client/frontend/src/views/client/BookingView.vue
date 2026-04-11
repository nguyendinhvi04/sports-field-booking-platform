<template>
  <div class="booking-page">
    <LoadingView v-if="loading" />

    <!-- ══ ANNOUNCEMENT BAR ══ -->
    <div class="announcement-bar" role="banner" aria-label="Thông báo mới">
      <p>
        🎉 Tính năng mới: Đặt lịch lặp lại & quản lý booking thông minh!
        <router-link to="/features" class="ann-link">Tìm hiểu thêm →</router-link>
      </p>
      <button class="ann-close" @click="showAnnouncement = false" aria-label="Đóng thông báo">×</button>
    </div>

    <div class="page-shell pt-24">

      <!-- ══ PAGE HEADER ══ -->
      <header class="page-header">
        <!-- Breadcrumb — SEO + UX -->
        <nav class="breadcrumb" aria-label="Điều hướng">
          <ol itemscope itemtype="https://schema.org/BreadcrumbList">
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
              <router-link to="/" itemprop="item"><span itemprop="name">Trang chủ</span></router-link>
              <meta itemprop="position" content="1" />
            </li>
            <li aria-hidden="true" class="sep">›</li>
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
              <router-link to="/sports" itemprop="item"><span itemprop="name">Thể thao</span></router-link>
              <meta itemprop="position" content="2" />
            </li>
            <li aria-hidden="true" class="sep">›</li>
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
              <span itemprop="name">{{ sportLabel }} tại {{ locationLabel }}</span>
              <meta itemprop="position" content="3" />
            </li>
          </ol>
        </nav>

        <!-- ✅ h1 — keyword-rich, dynamic, 1 per page -->
        <div class="header-row">
          <div>
            <h1 class="page-title">
              <span class="sport-highlight">{{ sportLabel }}</span>
              <span class="location-part">gần {{ locationLabel }}</span>
            </h1>
            <p class="results-meta" role="status" aria-live="polite">
              <span v-if="loading">Đang tìm kiếm…</span>
              <span v-else>
                Tìm thấy <strong>{{ totalCount }} địa điểm</strong>
                <span v-if="activeFilterCount > 0"> với {{ activeFilterCount }} bộ lọc đang áp dụng</span>
              </span>
            </p>
          </div>

          <div class="header-actions">
            <button class="btn-map" @click="toggleMap" :aria-pressed="showMap.toString()">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/>
                <line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
              {{ showMap ? 'ẨN BẢN ĐỒ' : 'XEM BẢN ĐỒ' }}
            </button>

            <!-- Mobile filter toggle -->
            <button class="btn-filter-toggle" @click="showMobileFilters = true" aria-label="Mở bộ lọc">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="20" y2="12"/>
                <line x1="12" y1="18" x2="20" y2="18"/>
              </svg>
              Lọc
              <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
            </button>
          </div>
        </div>

      </header>
    </div> <!-- end page-shell inner part (header) -->

    <div class="page-shell-map">
      <!-- Mapbox Map (toggle) -->
      <transition 
        name="slide-down"
        @after-enter="onMapTransitionEnd"
      >
        <div v-show="showMap" class="map-container" aria-label="Bản đồ các sân thể thao" role="region">
          <div ref="bookingMapEl" id="booking-map" class="booking-mapbox"></div>
          <div v-if="mapLoading" class="map-loader" aria-live="polite">
            <span class="map-spinner"></span>
            <span>Đang tải bản đồ...</span>
          </div>
          <div class="map-stats-badge" v-if="!mapLoading && venues.length > 0">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            {{ venues.filter(v => v.latitude && v.longitude).length }} sân trên bản đồ
          </div>
        </div>
      </transition>
    </div>

    <div class="page-shell pb-60">

      <!-- ══ ONLINE BOOKING ALERT ══ -->
      <div
        v-if="onlineBookingCount > 0"
        class="online-alert"
        role="note"
        aria-label="Thông tin đặt sân online"
      >
        <span class="alert-icon" aria-hidden="true">⚡</span>
        <span>
          Có <strong>{{ onlineBookingCount }} địa điểm</strong> cho phép đặt sân trực tuyến ngay lập tức.
          <button class="alert-filter-btn" @click="applyOnlineFilter">Lọc ngay</button>
        </span>
      </div>

      <!-- ══ MAIN CONTENT LAYOUT ══ -->
      <div class="content-layout">

        <!-- ─ SIDEBAR ─ -->
        <aside
          class="sidebar-wrap"
          :class="{ 'sidebar-wrap--open': showMobileFilters }"
          aria-label="Bộ lọc tìm kiếm sân"
        >
          <!-- Mobile overlay -->
          <div class="sidebar-overlay" @click="showMobileFilters = false" aria-hidden="true" />

          <div class="sidebar-inner">
            <!-- Mobile close -->
            <div class="sidebar-mobile-header">
              <span>Bộ lọc tìm kiếm</span>
              <button @click="showMobileFilters = false" aria-label="Đóng bộ lọc">×</button>
            </div>

            <BookingFilters
              v-model="filters"
              :booking-options="bookingOptions"
              :format-options="formatOptions"
              :surface-options="surfaceOptions"
              :radius-options="radiusOptions"
              :facility-options="facilityOptions"
              :sport-options="sportOptions"
              @update:modelValue="onFiltersChange"
              @clear="clearAllFilters"
            />
          </div>
        </aside>

        <!-- ─ VENUE LIST ─ -->
        <main id="venue-results" aria-label="Kết quả tìm kiếm sân">

          <!-- Sort bar -->
          <div class="sort-bar" role="toolbar" aria-label="Sắp xếp kết quả">
            <span class="sort-label">Sắp xếp:</span>
            <div class="sort-options" role="group">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                class="sort-btn"
                :class="{ active: currentSort === opt.value }"
                @click="setSort(opt.value)"
                :aria-pressed="(currentSort === opt.value).toString()"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loading" class="venues-stack" aria-busy="true">
            <div v-for="n in 3" :key="n" class="skeleton-card" role="presentation">
              <div class="skel-img" />
              <div class="skel-body">
                <div class="skel-line w-60" />
                <div class="skel-line w-40" />
                <div class="skel-line w-80 mt-8" />
                <div class="skel-line w-50" />
              </div>
              <div class="skel-cta">
                <div class="skel-line w-30" />
                <div class="skel-btn" />
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="paginatedVenues.length === 0" class="empty-state" role="status">
            <div class="empty-icon" aria-hidden="true">🔍</div>
            <h2 class="empty-title">Không tìm thấy sân phù hợp</h2>
            <p>Thử mở rộng bán kính hoặc xóa một số bộ lọc.</p>
            <button class="btn-clear-filters" @click="clearAllFilters">Xóa tất cả bộ lọc</button>
          </div>

          <!-- ✅ Venues — itemscope list for Schema.org -->
          <ol
            v-else
            class="venues-stack"
            itemscope
            itemtype="https://schema.org/ItemList"
            aria-label="Danh sách sân thể thao"
          >
            <meta itemprop="name" :content="`${sportLabel} tại ${locationLabel}`" />
            <meta itemprop="numberOfItems" :content="totalCount" />

            <li
              v-for="(venue, idx) in paginatedVenues"
              :key="venue.id"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
              :style="{ animationDelay: `${idx * 0.07}s` }"
              class="venue-list-item"
            >
              <meta itemprop="position" :content="(currentPage - 1) * pageSize + idx + 1" />
              <VenueCard :venue="venue" itemprop="item" />
            </li>
          </ol>

          <!-- Pagination -->
          <nav
            v-if="totalPages > 1"
            class="pagination"
            aria-label="Phân trang kết quả"
            role="navigation"
          >
            <button
              class="page-btn page-btn--arrow"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
              aria-label="Trang trước"
            >‹</button>

            <template v-for="page in visiblePages" :key="page">
              <span v-if="page === '...'" class="page-ellipsis" aria-hidden="true">…</span>
              <button
                v-else
                class="page-btn"
                :class="{ active: page === currentPage }"
                :aria-current="page === currentPage ? 'page' : undefined"
                @click="goToPage(page)"
              >{{ page }}</button>
            </template>

            <button
              class="page-btn page-btn--arrow"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
              aria-label="Trang sau"
            >›</button>
          </nav>

        </main>
      </div>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import BookingFilters from "@/components/client/booking/BookingFilters.vue";
import VenueCard      from "@/components/client/booking/VenueCard.vue";
import LoadingView    from "@/components/common/LoadingView.vue";
import { clubService } from "@/services/club.service.js";

const SPORT_LABELS = {
  football:    "Sân Bóng Đá",
  badminton:   "Sân Cầu Lông",
  tennis:      "Sân Tennis",
  pickleball:  "Sân Pickleball",
  basketball:  "Sân Bóng Rổ",
};

export default {
  name: "BookingView",
  components: { BookingFilters, VenueCard, LoadingView },
  data() {
    return {
      venues:             [],
      loading:            true,
      showAnnouncement:   true,
      showMap:            false,
      showMobileFilters:  false,
      currentPage:        1,
      pageSize:           8,
      totalCount:         0,
      currentSort:        "distance",
      userCoords:         null, // { lat: number, lng: number }
      // Map state
      bookingMap:         null,
      bookingMarkers:     [],
      bookingPopups:      {},
      mapLoading:         false,
      highlightedVenueId: null,

      filters: {
        sport:    this.$route?.query.sport    || "badminton",
        city:     this.$route?.query.city     || "",
        booking:  this.$route?.query.booking  ? [].concat(this.$route.query.booking) : [],
        byDate:   this.$route?.query.byDate   === "true" || !!this.$route?.query.date,
        date:     this.$route?.query.date     || new Date().toISOString().split("T")[0],
        format:   this.$route?.query.format   ? [].concat(this.$route.query.format)  : [],
        surface:  this.$route?.query.surface  ? [].concat(this.$route.query.surface) : [],
        radius:   this.$route?.query.radius   || "5",
        facility: this.$route?.query.facility ? [].concat(this.$route.query.facility): [],
      },

      sortOptions: [
        { value: "distance",  label: "Gần nhất" },
        { value: "rating",    label: "Đánh giá cao" },
        { value: "price_asc", label: "Giá thấp nhất" },
        { value: "newest",    label: "Mới nhất" },
      ],

      // ── Filter options ──────────────────────────────────────
      sportOptions: Object.entries(SPORT_LABELS).map(([value, label]) => ({ value, label })),

      bookingOptions: [
        { value: "partner", label: "Đối tác PlayFinder" },
        { value: "online",  label: "Đặt sân trực tuyến" },
      ],
      formatOptions: [
        { value: "indoor",  label: "Trong nhà" },
        { value: "outdoor", label: "Ngoài trời" },
      ],
      surfaceOptions: [
        { value: "wood",       label: "Sàn gỗ" },
        { value: "rubber",     label: "Cao su" },
        { value: "concrete",   label: "Bê tông" },
        { value: "artificial", label: "Cỏ nhân tạo" },
        { value: "sports_hall",label: "Nhà thi đấu" },
      ],
      radiusOptions: [
        { value: "1",  label: "Trong 1 km" },
        { value: "3",  label: "Trong 3 km" },
        { value: "5",  label: "Trong 5 km" },
        { value: "10", label: "Trong 10 km" },
        { value: "50", label: "Trong 50 km" },
      ],
      facilityOptions: [
        { value: "WiFi",          label: "Wifi miễn phí" },
        { value: "Bãi xe",        label: "Đỗ xe miễn phí" },
        { value: "Căng tin",      label: "Căng tin" },
        { value: "Phòng tắm",     label: "Phòng tắm" },
        // { value: "changing_room", label: "Phòng thay đồ" },
      ],
    };
  },

  computed: {
    sportLabel() {
      return SPORT_LABELS[this.filters.sport] || "Sân thể thao";
    },
    locationLabel() {
      return this.filters.city || "Đà Nẵng";
    },
    onlineBookingCount() {
      return this.venues.filter(v => v.hasOnlineBooking).length;
    },
    activeFilterCount() {
      let count = 0;
      if (this.filters.booking.length)  count += this.filters.booking.length;
      if (this.filters.format.length)   count += this.filters.format.length;
      if (this.filters.surface.length)  count += this.filters.surface.length;
      if (this.filters.facility.length) count += this.filters.facility.length;
      if (this.filters.byDate)          count += 1;
      if (this.filters.radius !== "5")  count += 1;
      return count;
    },
    sortedVenues() {
      const list = [...this.venues];
      switch (this.currentSort) {
        case "rating":    return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        case "price_asc": return list.sort((a, b) => (a.minPrice ?? 0) - (b.minPrice ?? 0));
        case "newest":    return list.reverse();
        default:          return list.sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));
      }
    },
    totalPages() {
      return Math.ceil(this.sortedVenues.length / this.pageSize);
    },
    paginatedVenues() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.sortedVenues.slice(start, start + this.pageSize);
    },
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const cur   = this.currentPage;
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        if (cur > 3)           pages.push("...");
        for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
        if (cur < total - 2)   pages.push("...");
        pages.push(total);
      }
      return pages;
    },
  },

  watch: {
    // ✅ Sync filters → URL query params (shareable + SEO)
    filters: {
      deep: true,
      handler(val) {
        const query = {};
        if (val.sport)            query.sport    = val.sport;
        if (val.city)             query.city     = val.city;
        if (val.booking.length)   query.booking  = val.booking;
        if (val.byDate) {
          query.byDate = "true";
          if (val.date) query.date = val.date;
        }
        if (val.format.length)    query.format   = val.format;
        if (val.surface.length)   query.surface  = val.surface;
        if (val.radius !== "5")   query.radius   = val.radius;
        if (val.facility.length)  query.facility = val.facility;
        this.$router?.replace({ query }).catch(() => {});
        this.currentPage = 1;
        this.fetchVenues();
      },
    },
  },

  async mounted() {
    await this.getUserLocation();
    await this.fetchVenues();
  },

  methods: {
    async fetchVenues() {
      this.loading = true;
      try {
        const params = {
          sport:    this.filters.sport,
          city:     this.filters.city,
          radius:   this.filters.radius,
          booking:  this.filters.booking,
          date:     this.filters.byDate ? this.filters.date : undefined,
          format:   this.filters.format,
          surface:  this.filters.surface,
          facility: this.filters.facility,
          lat:      this.userCoords?.lat,
          lng:      this.userCoords?.lng,
        };
        const res = await clubService.searchVenues(params);
        this.venues     = this.mapVenues(res.data.data);
        this.totalCount = this.venues.length;
      } catch (e) {
        console.error("fetchVenues error:", e);
      } finally {
        this.loading = false;
      }
    },

    async getUserLocation() {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          console.warn("Geolocation is not supported by this browser.");
          return resolve();
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userCoords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log("User location acquired:", this.userCoords);
            resolve();
          },
          (error) => {
            console.warn("Error getting user location:", error.message);
            resolve();
          },
          { timeout: 5000 }
        );
      });
    },

    mapVenues(data = []) {
      return data.map(item => ({
        id:              item.id,
        name:            item.name,
        slug:            item.slug,
        address:         item.address,
        district:        item.district,
        city:            item.city,
        image:           item.coverImageUrl || item.logoUrl || "https://images.unsplash.com/photo-1562552476-3f8e2f59a2b7?w=600&q=80",
        imageAlt:        `Sân ${item.name} tại ${item.address}`,
        distance:        item.distance != null ? parseFloat(item.distance).toFixed(1) : null,
        isPartner:       item.isPartner       ?? false,
        hasOnlineBooking: item.hasOnlineBooking ?? false,
        rating:          item.rating          ?? null,
        reviewCount:     item.reviewCount      ?? 0,
        minPrice:        item.minPrice         ?? null,
        amenities:       item.amenities        ?? [],
        openNow:         item.openNow          ?? null,
        closeTime:       item.closeTime        ?? null,
        sportType:       item.sportType        ?? this.filters.sport,
        latitude:        item.latitude,
        longitude:       item.longitude,
        pricingLabel:    item.pricingLabel     ?? null,
      }));
    },

    onFiltersChange(newVal) {
      this.filters = newVal;
    },

    clearAllFilters() {
      this.filters = {
        sport:    this.filters.sport,
        booking:  [],
        byDate:   false,
        format:   [],
        surface:  [],
        radius:   "5",
        facility: [],
      };
    },

    applyOnlineFilter() {
      if (!this.filters.booking.includes("online")) {
        this.filters = { ...this.filters, booking: [...this.filters.booking, "online"] };
      }
    },

    toggleMap() {
      this.showMap = !this.showMap;
      if (this.showMap) {
        // Init happens once
        if (!this.bookingMap) {
          this.$nextTick(() => this.initBookingMap());
        }
      }
    },

    onMapTransitionEnd() {
      if (this.bookingMap) {
        this.bookingMap.resize();
        // Re-fit in case bounds changed or weren't calculated on 0 size
        const withCoords = this.venues.filter(v => v.latitude && v.longitude);
        if (withCoords.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          withCoords.forEach(v => bounds.extend([v.longitude, v.latitude]));
          this.bookingMap.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 400 });
        }
      }
    },

    // ── Init Mapbox map in booking page ──
    initBookingMap() {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token || !this.$refs.bookingMapEl) return;

      if (this.bookingMap) {
        // Map đã tồn tại, chỉ cần render lại markers
        this.renderBookingMarkers();
        return;
      }

      mapboxgl.accessToken = token;
      this.mapLoading = true;

      // Tính center từ danh sách venues có toạ độ
      const withCoords = this.venues.filter(v => v.latitude && v.longitude);
      const center = withCoords.length > 0
        ? [withCoords[0].longitude, withCoords[0].latitude]
        : [106.6297, 10.8231]; // fallback HCM

      this.bookingMap = new mapboxgl.Map({
        container: this.$refs.bookingMapEl,
        style: 'mapbox://styles/mapbox/streets-v12',
        center,
        zoom: 12,
        attributionControl: false,
      });

      this.bookingMap.addControl(
        new mapboxgl.AttributionControl({ compact: true }), 'bottom-right'
      );

      this.bookingMap.on('load', () => {
        this.mapLoading = false;
        this.renderBookingMarkers();
        // Fit map to show all markers
        if (withCoords.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          withCoords.forEach(v => bounds.extend([v.longitude, v.latitude]));
          this.bookingMap.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 800 });
        }
      });
    },

    // ── Render/update markers on booking map ──
    renderBookingMarkers() {
      if (!this.bookingMap) return;

      // Clear old markers + popups
      this.bookingMarkers.forEach(m => m.remove());
      this.bookingMarkers = [];
      Object.values(this.bookingPopups).forEach(p => p.remove());
      this.bookingPopups = {};

      const SPORT_EMOJI = {
        FOOTBALL: '⚽', BADMINTON: '🏸', TENNIS: '🎾',
        PICKLEBALL: '🏓', BASKETBALL: '🏀', VOLLEYBALL: '🏐',
      };

      this.venues.forEach(venue => {
        if (!venue.latitude || !venue.longitude) return;

        // Marker element
        const el = document.createElement('div');
        el.className = 'bk-marker';
        el.innerHTML = `
          <div class="bk-pin"  data-vid="${venue.id}"  title="${venue.name}"  role="button"  aria-label="Sân ${venue.name}"  tabindex="0">
            <span class="bk-pin-emoji">${SPORT_EMOJI[venue.sportType?.toUpperCase()] || '📍'}</span>
            <span class="bk-pin-label">${venue.name.length > 14 ? venue.name.slice(0, 14) + '…' : venue.name}</span>
          </div>
          <div class="bk-shadow"></div>
        `;

        // Popup HTML
        const priceStr = venue.minPrice
          ? `Từ ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(venue.minPrice)}/h`
          : 'Liên hệ';
        const imgSrc = venue.image || 'https://images.unsplash.com/photo-1562552476-3f8e2f59a2b7?w=600&q=80';
        const distStr = venue.distance ? ` · ${venue.distance} km` : '';

        const popup = new mapboxgl.Popup({
          offset: 12,
          closeButton: false,
          maxWidth: '260px',
          className: 'bk-popup',
        }).setHTML(`
          <div class="bk-popup-inner">
            <img src="${imgSrc}" alt="${venue.name}" class="bk-popup-img" onerror="this.src='https://images.unsplash.com/photo-1562552476-3f8e2f59a2b7?w=200&q=60'" />
            <div class="bk-popup-body">
              <h4 class="bk-popup-name">${venue.name}</h4>
              <p class="bk-popup-addr">${venue.district || ''}${distStr}</p>
              <div class="bk-popup-foot">
                <span class="bk-popup-price">${priceStr}</span>
                <a href="/venue/${venue.slug}" class="bk-popup-btn" onclick="return false;" data-slug="${venue.slug}">Đặt sân</a>
              </div>
            </div>
          </div>
        `);

        popup.on('open', () => {
          const btn = document.querySelector(`.bk-popup [data-slug="${venue.slug}"]`);
          if (btn) btn.addEventListener('click', () => this.$router.push(`/venue/${venue.slug}`));
        });

        this.bookingPopups[venue.id] = popup;

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([venue.longitude, venue.latitude])
          .setPopup(popup)
          .addTo(this.bookingMap);

        el.addEventListener('click', () => {
          // Highlight card in list
          this.highlightedVenueId = venue.id;
          setTimeout(() => { this.highlightedVenueId = null; }, 2000);
        });

        this.bookingMarkers.push(marker);
      });
    },

    // ── Destroy map when hidden ──
    destroyBookingMap() {
      if (this.bookingMap) {
        this.bookingMarkers.forEach(m => m.remove());
        this.bookingMarkers = [];
        this.bookingMap.remove();
        this.bookingMap = null;
      }
    },

    setSort(val) {
      this.currentSort = val;
      this.currentPage = 1;
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      document.getElementById("venue-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
};
</script>


<style scoped src="@/assets/booking.css"></style>
<style src="@/assets/booking-global.css"></style>
