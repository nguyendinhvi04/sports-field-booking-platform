<template>
  <!-- ✅ Schema.org JSON-LD injected via vue-meta / useHead -->
  <div class="booking-page">

    <!-- ══ ANNOUNCEMENT BAR ══ -->
    <div class="announcement-bar" role="banner" aria-label="Thông báo mới">
      <p>
        🎉 Tính năng mới: Đặt lịch lặp lại & quản lý booking thông minh!
        <router-link to="/features" class="ann-link">Tìm hiểu thêm →</router-link>
      </p>
      <button class="ann-close" @click="showAnnouncement = false" aria-label="Đóng thông báo">×</button>
    </div>

    <div class="page-shell">

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

        <!-- Map placeholder (toggle) -->
        <transition name="slide-down">
          <div v-if="showMap" class="map-container" aria-label="Bản đồ các sân thể thao" role="region">
            <div class="map-placeholder">
              <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>
              <span>Bản đồ tương tác (tích hợp Google Maps / Leaflet)</span>
            </div>
          </div>
        </transition>
      </header>

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
import BookingFilters from "@/components/client/booking/BookingFilters.vue";
import VenueCard      from "@/components/client/booking/VenueCard.vue";
import { clubService } from "@/services/club.service.js";

const SPORT_LABELS = {
  badminton:   "Sân Cầu Lông",
  football:    "Sân Bóng Đá",
  tennis:      "Sân Tennis",
  pickleball:  "Sân Pickleball",
  basketball:  "Sân Bóng Rổ",
  volleyball:  "Sân Bóng Chuyền",
};

export default {
  name: "BookingView",
  components: { BookingFilters, VenueCard },

  // ── vue-meta SEO ──────────────────────────────────────────
  // metaInfo() {
  //   return {
  //     title: `${this.totalCount} ${this.sportLabel} gần ${this.locationLabel} | PlayFinder`,
  //     meta: [
  //       { name: "description", content: `Tìm và đặt ${this.sportLabel.toLowerCase()} gần ${this.locationLabel}. ${this.totalCount} địa điểm uy tín, đặt sân trực tuyến nhanh chóng, giá tốt nhất.` },
  //       { name: "robots",       content: "index, follow" },
  //       { property: "og:title", content: `${this.sportLabel} tại ${this.locationLabel} - PlayFinder` },
  //       { property: "og:type",  content: "website" },
  //     ],
  //     link: [
  //       { rel: "canonical", href: `https://playfinder.vn/san/${this.$route.params.sport}/${this.$route.params.city}` }
  //     ],
  //     // Schema.org JSON-LD
  //     script: [{
  //       type: "application/ld+json",
  //       json: {
  //         "@context": "https://schema.org",
  //         "@type": "SearchResultsPage",
  //         "name": `${this.sportLabel} gần ${this.locationLabel}`,
  //         "description": `Danh sách ${this.totalCount} ${this.sportLabel.toLowerCase()} tại ${this.locationLabel}`,
  //         "url": `https://playfinder.vn/san/${this.$route.params.sport}/${this.$route.params.city}`
  //       }
  //     }]
  //   };
  // },

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

      filters: {
        sport:    this.$route?.query.sport    || "badminton",
        city:     this.$route?.query.city     || "",
        booking:  this.$route?.query.booking  ? [].concat(this.$route.query.booking) : [],
        byDate:   this.$route?.query.byDate   === "true",
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
        { value: "changing_room", label: "Phòng thay đồ" },
        { value: "free_parking",  label: "Đỗ xe miễn phí" },
        { value: "wifi",          label: "Wifi miễn phí" },
        { value: "canteen",       label: "Căng tin" },
        { value: "shower",        label: "Phòng tắm" },
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
        if (val.byDate)           query.byDate   = "true";
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
          format:   this.filters.format,
          surface:  this.filters.surface,
          facility: this.filters.facility,
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

    toggleMap() { this.showMap = !this.showMap; },

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

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800;900&display=swap");

/* ══ Variables ══ */
.booking-page {
  --green:       #3dd56d;
  --green-dark:  #28b857;
  --green-light: rgba(61, 213, 109, 0.12);
  --cyan:        #0891b2;
  --text:        #111827;
  --muted:       #6b7280;
  --border:      #e5e7eb;
  --bg:          #f4f5f7;
  --card:        #ffffff;
  --radius:      10px;
  --shadow:      0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);

  font-family: "Barlow", sans-serif;
  font-size: 14px;
  background: var(--bg);
  min-height: 100vh;
  color: var(--text);
}

/* ══ Announcement bar ══ */
.announcement-bar {
  background: #0c4a6e;
  color: #fff;
  text-align: center;
  padding: 9px 48px;
  font-size: 13px;
  font-weight: 500;
  position: relative;
  line-height: 1.5;
}
.ann-link { color: #7dd3fc; font-weight: 700; text-decoration: none; margin-left: 6px; }
.ann-link:hover { text-decoration: underline; }
.ann-close {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: rgba(255,255,255,.7);
  font-size: 18px; cursor: pointer; line-height: 1; padding: 2px 6px;
}
.ann-close:hover { color: #fff; }

/* ══ Page shell ══ */
.page-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 24px 60px;
}

/* ══ Breadcrumb ══ */
.breadcrumb ol {
  display: flex; align-items: center; gap: 6px;
  list-style: none; margin: 0 0 14px; padding: 0;
  font-size: 12px; color: var(--muted);
}
.breadcrumb a { color: var(--muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--green-dark); }
.sep { color: var(--border); }

/* ══ Page header ══ */
.header-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px;
  flex-wrap: wrap; margin-bottom: 20px;
}

.page-title {
  font-family: "Barlow Condensed", sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0 0 8px;
}

.sport-highlight {
  display: block;
  color: var(--text);
}

.location-part {
  display: block;
  font-size: 0.6em;
  font-weight: 600;
  color: var(--muted);
  letter-spacing: 0.02em;
}

.results-meta {
  font-size: 13.5px;
  color: var(--muted);
  margin: 0;
}
.results-meta strong { color: var(--text); }

/* Header actions */
.header-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

.btn-map {
  display: flex; align-items: center; gap: 7px;
  background: var(--card); border: 1.5px solid var(--border);
  border-radius: 8px; padding: 9px 16px;
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 700; font-size: 13px; letter-spacing: 0.06em;
  color: var(--text); cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.btn-map svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2; }
.btn-map:hover { border-color: var(--green); box-shadow: 0 0 0 3px var(--green-light); }

.btn-filter-toggle {
  display: none;
  align-items: center; gap: 6px;
  background: var(--text); color: #fff;
  border: none; border-radius: 8px;
  padding: 9px 16px; font-weight: 700;
  font-size: 13px; cursor: pointer;
  position: relative;
}
.btn-filter-toggle svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2.5; }
.filter-badge {
  position: absolute; top: -6px; right: -6px;
  background: var(--green); color: #fff;
  border-radius: 999px; min-width: 18px; height: 18px;
  font-size: 10px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; padding: 0 4px;
}

/* ══ Map container ══ */
.map-container {
  background: var(--card); border: 1.5px solid var(--border);
  border-radius: var(--radius); margin-bottom: 20px;
  overflow: hidden;
}
.map-placeholder {
  height: 300px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  color: var(--muted); font-size: 14px;
}
.map-placeholder svg { width: 40px; height: 40px; stroke: var(--border); fill: none; stroke-width: 1.5; }

/* ══ Online alert ══ */
.online-alert {
  background: #fefce8; border: 1.5px solid #fde68a;
  border-radius: var(--radius); padding: 12px 16px;
  font-size: 13.5px; color: #713f12;
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 20px; line-height: 1.5;
}
.online-alert strong { color: #92400e; }
.alert-icon { font-size: 16px; flex-shrink: 0; }
.alert-filter-btn {
  background: none; border: none; color: var(--cyan);
  font-weight: 700; font-size: 13px; cursor: pointer;
  text-decoration: underline; padding: 0; margin-left: 4px;
}

/* ══ Content layout ══ */
.content-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  align-items: start;
}

/* ══ Sidebar ══ */
.sidebar-wrap { position: sticky; top: 20px; }
.sidebar-inner { background: var(--card); border: 1.5px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.sidebar-overlay { display: none; }
.sidebar-mobile-header { display: none; }

/* ══ Sort bar ══ */
.sort-bar {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px; flex-wrap: wrap;
}
.sort-label { font-size: 12.5px; color: var(--muted); font-weight: 500; }
.sort-options { display: flex; gap: 6px; flex-wrap: wrap; }
.sort-btn {
  background: var(--card); border: 1.5px solid var(--border);
  border-radius: 999px; padding: 5px 14px;
  font-size: 12.5px; font-weight: 600; color: var(--muted);
  cursor: pointer; transition: all .18s;
}
.sort-btn:hover { border-color: var(--green); color: var(--text); }
.sort-btn.active { background: var(--text); border-color: var(--text); color: #fff; }

/* ══ Venues stack ══ */
.venues-stack {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 16px;
}
.venue-list-item { animation: fadeUp .45s ease both; }
@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }

/* ══ Skeleton ══ */
.skeleton-card {
  background: var(--card); border: 1.5px solid var(--border);
  border-radius: var(--radius); display: flex; overflow: hidden; min-height: 160px;
}
.skel-img { width: 220px; flex-shrink: 0; background: #e9ebee; }
.skel-body { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.skel-cta { width: 160px; padding: 20px; display: flex; flex-direction: column; gap: 10px; justify-content: flex-end; }
.skel-line { height: 11px; border-radius: 6px; background: linear-gradient(90deg, #e9ebee 25%, #f3f4f6 50%, #e9ebee 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.skel-btn { height: 38px; border-radius: 8px; background: #e9ebee; animation: shimmer 1.4s infinite; }
.w-30{width:30%} .w-40{width:40%} .w-50{width:50%} .w-60{width:60%} .w-80{width:80%} .mt-8{margin-top:8px}
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

/* ══ Empty state ══ */
.empty-state {
  background: var(--card); border: 1.5px dashed var(--border);
  border-radius: var(--radius); padding: 60px 24px;
  text-align: center;
}
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-title { font-family: "Barlow Condensed", sans-serif; font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; }
.empty-state p { color: var(--muted); margin-bottom: 20px; }
.btn-clear-filters {
  background: var(--green); color: #fff; border: none;
  border-radius: 8px; padding: 10px 24px;
  font-weight: 700; font-size: 13px; cursor: pointer;
  transition: background .2s, transform .2s;
}
.btn-clear-filters:hover { background: var(--green-dark); transform: translateY(-1px); }

/* ══ Pagination ══ */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; margin-top: 32px; flex-wrap: wrap;
}
.page-btn {
  min-width: 36px; height: 36px; border-radius: 8px;
  border: 1.5px solid var(--border); background: var(--card);
  color: var(--text); font-weight: 600; font-size: 13px;
  cursor: pointer; transition: all .18s;
}
.page-btn:hover:not(:disabled) { border-color: var(--green); color: var(--green-dark); }
.page-btn.active { background: var(--text); border-color: var(--text); color: #fff; }
.page-btn:disabled { opacity: .35; cursor: not-allowed; }
.page-btn--arrow { font-size: 16px; }
.page-ellipsis { color: var(--muted); padding: 0 4px; }

/* ══ Transitions ══ */
.slide-down-enter-active, .slide-down-leave-active { transition: all .35s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { max-height: 0; opacity: 0; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 400px; opacity: 1; }

/* ══ Responsive ══ */
@media (max-width: 900px) {
  .content-layout { grid-template-columns: 1fr; }

  .sidebar-wrap {
    position: fixed; inset: 0; z-index: 1000;
    pointer-events: none; opacity: 0;
    transition: opacity .3s;
  }
  .sidebar-wrap--open { pointer-events: all; opacity: 1; }

  .sidebar-overlay {
    display: block; position: absolute; inset: 0;
    background: rgba(0,0,0,.5);
  }
  .sidebar-inner {
    position: absolute; top: 0; left: 0;
    width: min(320px, 90vw); height: 100%;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform .3s ease;
  }
  .sidebar-wrap--open .sidebar-inner { transform: none; }

  .sidebar-mobile-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    font-weight: 700; font-size: 15px;
  }
  .sidebar-mobile-header button {
    background: none; border: none; font-size: 22px;
    cursor: pointer; color: var(--muted); line-height: 1;
  }

  .btn-filter-toggle { display: flex; }
  .btn-map { font-size: 12px; padding: 8px 12px; }
}

@media (max-width: 600px) {
  .page-shell { padding: 16px 16px 48px; }
  .header-row { flex-direction: column; }
}
</style>