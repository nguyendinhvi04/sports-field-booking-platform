<template>
  <div>
    <HeroView />
    <main id="main-content">
      <!-- ── Cities ── -->
      <section
        id="cities"
        aria-labelledby="cities-heading"
        class="section-wrapper"
      >
        <CitiesView heading-id="cities-heading" />
      </section>
      <section
        id="nearby-venues"
        aria-labelledby="nearby-heading"
        class="section-wrapper nearby-section"
        itemscope
        itemtype="https://schema.org/ItemList"
      >
        <meta itemprop="name" content="Sân thể thao gần bạn" />

        <div class="container">
          <!-- ✅ h2 đúng hierarchy (HeroView giữ h1) -->
          <header class="section-header">
            <h2 id="nearby-heading" class="section-title">
              Sân gần bạn
            </h2>
            <p class="section-subtitle">
              Tìm sân thể thao chất lượng gần vị trí của bạn — đặt sân nhanh chóng, tiện lợi
            </p>
          </header>

          <!-- Loading skeleton -->
          <div v-if="loading" class="venues-grid" aria-busy="true" aria-label="Đang tải danh sách sân">
            <div
              v-for="n in 6"
              :key="n"
              class="skeleton-card"
              role="presentation"
            >
              <div class="skeleton-img" />
              <div class="skeleton-body">
                <div class="skeleton-line w-70" />
                <div class="skeleton-line w-50" />
                <div class="skeleton-line w-40" />
              </div>
            </div>
          </div>
          <div
            v-else-if="error"
            role="alert"
            class="error-state"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>{{ error }}</p>
            <button class="btn-retry" @click="fetchNearbyClubs">Thử lại</button>
          </div>
          <div
            v-else-if="danhSachSan.length > 0"
            class="venues-grid"
          >
            <article
              v-for="(venue, index) in danhSachSan"
              :key="venue.id"
              class="venue-item"
              :style="{ animationDelay: `${index * 0.08}s` }"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/SportsActivityLocation"
            >
              <!-- Schema.org structured data -->
              <meta itemprop="position" :content="index + 1" />
              <meta itemprop="name" :content="venue.name" />
              <meta itemprop="address" :content="venue.address" />
              <link itemprop="url" :href="`/venue/${venue.id}`" />

              <VenueCard :venue="venue" />
            </article>
          </div>
          <div v-else class="empty-state" role="status">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p>Không tìm thấy sân nào xung quanh vị trí của bạn.</p>
            <button class="btn-retry" @click="loadDefaultClubs">Xem sân tại Đà Nẵng</button>
          </div>
          <div v-if="!loading && danhSachSan.length > 0" class="view-all-wrap">
            <router-link to="/venues" class="btn-view-all">
              Xem tất cả sân
              <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </router-link>
          </div>
        </div>
      </section>
       <!-- ── Services ── -->
      <section
        id="services"
        aria-labelledby="services-heading"
        class="section-wrapper"
      >
        <ServicesView heading-id="services-heading" />
      </section>
      <!-- ── Statistics ── -->
      <section
        id="statistics"
        aria-labelledby="stats-heading"
        class="section-wrapper"
      >
        <StatisticsView heading-id="stats-heading" />
      </section>
     
      <!-- ── Blog ── -->
      <section
        id="blog"
        aria-labelledby="blog-heading"
        class="section-wrapper"
        itemscope
        itemtype="https://schema.org/Blog"
      >
        <BlogView heading-id="blog-heading" />
      </section>
            <section
        id="venue-showcase"
        aria-labelledby="showcase-heading"
        class="section-wrapper"
      >
        <VenueView heading-id="showcase-heading" />
      </section>


    </main>
  </div>
</template>

<script>
import CitiesView     from "@/components/client/home/CitiesView.vue";
import HeroView       from "@/components/client/home/HeroView.vue";
import StatisticsView from "@/components/client/home/StatisticsView.vue";
import ServicesView   from "@/components/client/home/ServicesView.vue";
import BlogView       from "@/components/client/home/BlogView.vue";
import VenueView      from "@/components/client/home/VenueView.vue";
import VenueCard      from "@/components/client/booking/VenueCard.vue";
import { clubService } from "@/services/club.service.js";

// ── Default fallback coords: Đà Nẵng ──
const DEFAULT_LAT = 16.047079;
const DEFAULT_LNG = 108.206230;

export default {
  name: "HomeView",

  components: {
    HeroView,
    CitiesView,
    StatisticsView,
    ServicesView,
    BlogView,
    VenueView,
    VenueCard,
  },

  data() {
    return {
      danhSachSan: [],
      loading: true,
      error: null,
    };
  },

  computed: {
    /**
     * ✅ Structured Data (JSON-LD)
     * Giúp Google hiểu nội dung trang web tốt hơn (Rich Snippets).
     */
    schemaOrg() {
      return [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "PlayFinder",
          "alternateName": "Hệ thống đặt sân PlayFinder",
          "url": "https://playfinder.vn",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://playfinder.vn/san?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "PlayFinder",
          "url": "https://playfinder.vn",
          "logo": "https://playfinder.vn/logo.png",
          "sameAs": [
            "https://www.facebook.com/playfinder.vn",
            "https://www.instagram.com/playfinder.vn"
          ]
        }
      ];
    }
  },

  async mounted() {
    // ✅ Manual SEO update (fallback if no vue-meta)
    document.title = "Đặt sân bóng đá, tennis, cầu lông gần bạn | PlayFinder Việt Nam";

    await this.loadDefaultClubs();
    this.tryGeolocation();
  },

  methods: {
    // ── 1. Load default clubs (Đà Nẵng) — luôn chạy trước ──
    async loadDefaultClubs() {
      this.loading = true;
      this.error = null;
      try {
        const res = await clubService.getNearbyClubs(DEFAULT_LAT, DEFAULT_LNG);
        this.danhSachSan = this.mapVenues(res.data.data);
      } catch (e) {
        console.error("Default club load error:", e);
        this.error = "Không thể tải danh sách sân. Vui lòng thử lại.";
      } finally {
        this.loading = false;
      }
    },

    // ── 2. Geolocation refinement (không block UI) ──
    tryGeolocation() {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude } }) => {
          try {
            const res = await clubService.getNearbyClubs(latitude, longitude);
            const refined = this.mapVenues(res.data.data);
            if (refined.length > 0) this.danhSachSan = refined;
          } catch (e) {
            // Silently fall back — default list already showing
            console.warn("Geolocation refine failed:", e);
          }
        },
        (err) => console.warn("Geolocation denied:", err.message),
        { timeout: 8000, maximumAge: 300_000 }
      );
    },

    // ── Lấy lại nếu error ──
    async fetchNearbyClubs() {
      await this.loadDefaultClubs();
    },

    // ── Map API response → UI model ──
    mapVenues(data = []) {
      return data.map((item) => ({
        id:              item.id,
        name:            item.name,
        address:         item.address,
        image:           item.coverImageUrl || item.logoUrl || "https://images.unsplash.com/photo-1544691371-464a4d46af63?w=600&q=80",
        imageAlt:        `Sân thể thao ${item.name} tại ${item.address}`, 
        distance:        item.distance ? `${parseFloat(item.distance).toFixed(1)} km` : null,
        isPartner:       true,
        hasOnlineBooking: true,
        rating:          item.rating   ?? 4.8, 
        reviewCount:     item.reviewCount ?? 0,          
        slug:            item.slug || item.id,
      }));
    },
  },
};
</script>

<style scoped>
/* ── Variables ── */
.nearby-section {
  --green: #3dd56d;
  --green-dark: #28b857;
  --text-dark: #1a1a2e;
  --text-muted: #6b7280;
  --bg-section: #f7f8fa;
  --border: #e5e7eb;
  --radius: 12px;
}

/* ── Section wrapper spacing ── */
.section-wrapper {
  padding: 0;
}

.nearby-section {
  background: var(--bg-section);
  padding: 72px 0 80px;
}

/* ── Section header ── */
.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-dark);
  margin-bottom: 12px;
  position: relative;
  display: inline-block;
  padding-bottom: 16px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--green);
  border-radius: 2px;
}

.section-subtitle {
  font-size: 0.97rem;
  color: var(--text-muted);
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.65;
}

/* ── Venues Grid: 3 cols → 2 → 1 ── */
.venues-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);   /* ✅ 3 cột trên desktop */
  gap: 24px;
}

@media (max-width: 992px) {
  .venues-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .venues-grid { grid-template-columns: 1fr; }
}

/* ── Venue item animation ── */
.venue-item {
  animation: fadeUp 0.5s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Skeleton loading ── */
.skeleton-card {
  border-radius: var(--radius);
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--border);
}

.skeleton-img {
  width: 100%;
  height: 180px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-70 { width: 70%; }
.w-50 { width: 50%; }
.w-40 { width: 40%; }

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

/* ── Error / Empty states ── */
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);
  text-align: center;
}

.error-state svg,
.empty-state svg {
  width: 48px;
  height: 48px;
  stroke: var(--text-muted);
  stroke-width: 1.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.btn-retry {
  background: var(--green);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-retry:hover {
  background: var(--green-dark);
  transform: translateY(-1px);
}

/* ── View All CTA ── */
.view-all-wrap {
  display: flex;
  justify-content: center;
  margin-top: 44px;
}

.btn-view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--text-dark);
  border: 2px solid var(--text-dark);
  border-radius: 6px;
  padding: 12px 32px;
  font-family: 'Barlow', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.25s ease;
}

.btn-view-all svg {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  transition: transform 0.25s ease;
}

.btn-view-all:hover {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(61, 213, 109, 0.3);
}

.btn-view-all:hover svg {
  transform: translateX(4px);
}
</style>