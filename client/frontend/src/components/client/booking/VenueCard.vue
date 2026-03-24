<template>
  <article
    class="venue-card"
    :class="{
      'venue-card--partner':  venue.isPartner,
      'venue-card--promo':    venue.isPromo,
      'venue-card--skeleton': !venue.id,
    }"
    itemscope
    itemtype="https://schema.org/SportsActivityLocation"
  >
    <!-- ✅ Schema.org hidden meta -->
    <meta itemprop="name"    :content="venue.name" />
    <meta itemprop="address" :content="venue.address" />
    <link itemprop="url"     :href="`/venue/${venue.slug || venue.id}`" />
    <template v-if="venue.rating">
      <span itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating" class="sr-only">
        <meta itemprop="ratingValue"  :content="venue.rating" />
        <meta itemprop="reviewCount"  :content="venue.reviewCount" />
        <meta itemprop="bestRating"   content="5" />
        <meta itemprop="worstRating"  content="1" />
      </span>
    </template>

    <!-- ══ PROMO CARD ══ -->
    <div v-if="venue.isPromo" class="promo-card">
      <img
        :src="venue.image"
        :alt="venue.name"
        class="promo-bg"
        loading="lazy"
        width="600" height="300"
      />
      <div class="promo-overlay">
        <span class="promo-eyebrow">Đối tác mới</span>
        <h2 class="promo-title">{{ venue.name }}</h2>
        <p class="promo-sub">{{ venue.address }}</p>
        <router-link :to="`/venue/${venue.slug || venue.id}`" class="promo-cta">
          Khám phá ngay →
        </router-link>
      </div>
    </div>

    <!-- ══ NORMAL CARD ══ -->
    <div v-else class="card-body">

      <!-- ─ IMAGE COLUMN ─ -->
      <div class="image-col">
        <div class="image-wrap">
          <img
            :src="venue.image"
            :alt="venue.imageAlt || `Sân ${venue.name}`"
            class="venue-img"
            loading="lazy"
            width="240" height="170"
            itemprop="image"
          />

          <!-- Badges -->
          <div class="badge-stack">
            <span v-if="venue.isPartner" class="badge badge--partner">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#16a34a"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Đối tác
            </span>
            <span v-if="venue.isNew" class="badge badge--new">MỚI</span>
            <span v-if="venue.isHot" class="badge badge--hot">🔥 HOT</span>
          </div>

          <!-- Image slider controls -->
          <div v-if="venue.hasSlider" class="slider-ctrl" aria-label="Ảnh sân">
            <button class="slide-btn" @click.prevent="prevImg" aria-label="Ảnh trước">‹</button>
            <button class="slide-btn" @click.prevent="nextImg" aria-label="Ảnh tiếp">›</button>
          </div>

          <!-- Open status pill -->
          <div v-if="venue.openNow !== null" class="open-pill" :class="venue.openNow ? 'open-pill--open' : 'open-pill--closed'">
            <span class="open-dot" aria-hidden="true"></span>
            {{ venue.openNow ? 'Đang mở cửa' : `Đóng cửa` }}
            <span v-if="venue.closeTime && venue.openNow"> · Đến {{ venue.closeTime }}</span>
            <span v-if="!venue.openNow && venue.openTime"> · Mở lúc {{ venue.openTime }}</span>
          </div>
        </div>
      </div>

      <!-- ─ INFO COLUMN ─ -->
      <div class="info-col">

        <!-- Name + rating -->
        <div class="info-top">
          <div class="name-row">
            <h2 class="venue-name" itemprop="name">
              <span v-if="venue.hasOnlineBooking" class="bolt-icon" title="Đặt sân trực tuyến" aria-label="Đặt sân trực tuyến">⚡</span>
              <router-link :to="`/venue/${venue.slug || venue.id}`" class="name-link">
                {{ venue.name }}
              </router-link>
            </h2>

            <div v-if="venue.rating" class="rating-row" aria-label="`Đánh giá ${venue.rating} sao từ ${venue.reviewCount} đánh giá`">
              <div class="stars" aria-hidden="true">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(venue.rating), half: i === Math.ceil(venue.rating) && !Number.isInteger(venue.rating) }">★</span>
              </div>
              <span class="rating-val">{{ venue.rating }}</span>
              <span class="review-count">({{ venue.reviewCount }} đánh giá)</span>
            </div>
          </div>

          <!-- Address -->
          <address class="venue-address" itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span itemprop="streetAddress">{{ venue.address }}</span>
            <span v-if="venue.distance" class="distance-chip">{{ venue.distance }} km</span>
          </address>

          <!-- Sport + surface chips -->
          <div class="chip-row" role="list" aria-label="Thông tin sân">
            <span v-if="venue.sportType" class="chip chip--sport" role="listitem" itemprop="sport">
              {{ sportLabels[venue.sportType] || venue.sportType }}
            </span>
            <span v-if="venue.format" class="chip" role="listitem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              {{ venue.format }}
            </span>
            <span v-if="venue.surface" class="chip" role="listitem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              {{ venue.surface }}
            </span>
            <span v-if="venue.type" class="chip" role="listitem">{{ venue.type }}</span>
          </div>
        </div>

        <!-- Pricing tiers -->
        <div v-if="venue.pricings && venue.pricings.length" class="pricing-tiers" aria-label="Bảng giá sân">
          <div v-for="tier in venue.pricings.slice(0, 3)" :key="tier.label" class="tier">
            <span class="tier-label">{{ tier.label }}</span>
            <span class="tier-price">{{ formatPrice(tier.pricePerHour) }}<small>/h</small></span>
          </div>
        </div>
        <div v-else-if="venue.minPrice" class="pricing-simple">
          <span class="price-from">Giá từ</span>
          <span class="price-value" itemprop="priceRange">{{ formatPrice(venue.minPrice) }}<small>/h</small></span>
        </div>

        <!-- Amenities -->
        <ul class="amenities-row" aria-label="Tiện ích">
          <li v-for="amenity in displayAmenities" :key="amenity.key" class="amenity" :title="amenity.label">
            <svg viewBox="0 0 24 24" v-html="amenity.icon" aria-hidden="true" />
            <span>{{ amenity.label }}</span>
          </li>
        </ul>
      </div>

      <!-- ─ CTA COLUMN ─ -->
      <div class="cta-col">
        <!-- Available slots urgency -->
        <div v-if="venue.availableSlots > 0" class="slots-badge" role="status" :aria-label="`Còn ${venue.availableSlots} slot trống`">
          <span class="slot-dot" aria-hidden="true"></span>
          Còn <strong>{{ venue.availableSlots }}</strong> slot hôm nay
        </div>
        <div v-else-if="venue.availableSlots === 0" class="slots-badge slots-badge--full" role="status">
          Hết slot hôm nay
        </div>

        <!-- CTA button -->
        <router-link
          :to="`/venue/${venue.slug || venue.id}`"
          class="cta-btn"
          :class="venue.hasOnlineBooking ? 'cta-btn--book' : 'cta-btn--view'"
          :aria-label="venue.hasOnlineBooking ? `Đặt sân ${venue.name} ngay` : `Xem chi tiết ${venue.name}`"
        >
          <svg v-if="venue.hasOnlineBooking" viewBox="0 0 24 24" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          {{ venue.hasOnlineBooking ? 'ĐẶT SÂN NGAY' : 'XEM CHI TIẾT' }}
        </router-link>

        <!-- Secondary: add to favorite -->
        <button
          class="fav-btn"
          :class="{ active: isFavorited }"
          @click.prevent="toggleFavorite"
          :aria-label="isFavorited ? `Bỏ yêu thích ${venue.name}` : `Yêu thích ${venue.name}`"
          :aria-pressed="isFavorited.toString()"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {{ isFavorited ? 'Đã lưu' : 'Lưu' }}
        </button>

        <!-- Partner note -->
        <p v-if="venue.isPartner" class="partner-note">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Đối tác chính thức PlayFinder
        </p>
      </div>

    </div>
  </article>
</template>

<script>
const SPORT_LABELS = {
  FOOTBALL:   "Bóng đá",
  BADMINTON:  "Cầu lông",
  TENNIS:     "Tennis",
  PICKLEBALL: "Pickleball",
  BASKETBALL: "Bóng rổ",
  VOLLEYBALL: "Bóng chuyền",
  OTHER:      "Thể thao",
};

const AMENITY_ICONS = {
  changing_room: { label: "Phòng thay đồ", icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>` },
  free_parking:  { label: "Đỗ xe miễn phí", icon: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>` },
  wifi:          { label: "Wifi", icon: `<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>` },
  canteen:       { label: "Căng tin", icon: `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>` },
  shower:        { label: "Phòng tắm", icon: `<path d="M4 12h16M4 12a8 8 0 0 1 16 0"/><path d="M10 16v2M14 16v2M8 18v1M16 18v1M12 16v4"/>` },
};

export default {
  name: "VenueCard",
  props: {
    venue: { type: Object, required: true },
  },
  emits: ["favorite"],

  data() {
    return {
      isFavorited: false,
      currentImgIdx: 0,
      sportLabels: SPORT_LABELS,
    };
  },

  computed: {
    displayAmenities() {
      // Support both flat boolean fields and amenities array from DB
      const result = [];
      if (Array.isArray(this.venue.amenities) && this.venue.amenities.length) {
        return this.venue.amenities
          .filter(a => AMENITY_ICONS[a.key || a])
          .map(a => {
            const key = a.key || a;
            return { key, ...AMENITY_ICONS[key] };
          })
          .slice(0, 4);
      }
      // Fallback: boolean fields
      if (this.venue.changingRoom) result.push({ key: "changing_room", ...AMENITY_ICONS.changing_room });
      if (this.venue.freeParking)  result.push({ key: "free_parking",  ...AMENITY_ICONS.free_parking });
      if (this.venue.wifi)         result.push({ key: "wifi",          ...AMENITY_ICONS.wifi });
      return result.slice(0, 4);
    },
  },

  methods: {
    formatPrice(price) {
      if (!price) return "";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency", currency: "VND", maximumFractionDigits: 0,
      }).format(price);
    },

    toggleFavorite() {
      this.isFavorited = !this.isFavorited;
      this.$emit("favorite", { id: this.venue.id, favorited: this.isFavorited });
    },

    prevImg() { this.currentImgIdx = Math.max(0, this.currentImgIdx - 1); },
    nextImg() { this.currentImgIdx++; },
  },
};
</script>

<style scoped>
/* ── Variables ── */
.venue-card {
  --green:       #3dd56d;
  --green-dark:  #28b857;
  --green-light: rgba(61,213,109,.12);
  --text:        #111827;
  --muted:       #6b7280;
  --border:      #e5e7eb;
  --card:        #ffffff;
  --radius:      10px;
  --shadow:      0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);

  font-family: "Barlow", sans-serif;
  font-size: 13.5px;
  color: var(--text);
}

/* ── Screen-reader only ── */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* ══ NORMAL CARD ══ */
.card-body {
  display: flex;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: box-shadow .25s ease, border-color .25s ease, transform .25s ease;
}

.card-body:hover {
  box-shadow: 0 4px 24px rgba(0,0,0,.1), 0 0 0 2px var(--green);
  border-color: var(--green);
  transform: translateY(-2px);
}

/* ─ Image column ─ */
.image-col { flex-shrink: 0; width: 220px; }

.image-wrap {
  position: relative; width: 100%; height: 100%;
  min-height: 160px; overflow: hidden;
}

.venue-img {
  width: 100%; height: 100%; object-fit: cover;
  display: block;
  transition: transform .4s ease;
}
.card-body:hover .venue-img { transform: scale(1.04); }

/* Badges */
.badge-stack {
  position: absolute; top: 10px; left: 10px;
  display: flex; flex-direction: column; gap: 5px;
}

.badge {
  display: inline-flex; align-items: center; gap: 4px;
  border-radius: 999px; padding: 3px 9px;
  font-size: 10px; font-weight: 800; letter-spacing: 0.06em;
  text-transform: uppercase;
}
.badge--partner { background: rgba(255,255,255,.95); color: #15803d; }
.badge--partner svg { width: 12px; height: 12px; }
.badge--new { background: #1d4ed8; color: #fff; }
.badge--hot { background: #dc2626; color: #fff; }

/* Slider controls */
.slider-ctrl {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 8px; opacity: 0;
  transition: opacity .2s;
}
.image-wrap:hover .slider-ctrl { opacity: 1; }

.slide-btn {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(255,255,255,.9); border: none;
  font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
  transition: background .2s;
}
.slide-btn:hover { background: #fff; }

/* Open pill */
.open-pill {
  position: absolute; bottom: 8px; left: 8px;
  display: flex; align-items: center; gap: 5px;
  border-radius: 999px; padding: 4px 10px;
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em;
  backdrop-filter: blur(6px);
}
.open-pill--open  { background: rgba(22,163,74,.9);  color: #fff; }
.open-pill--closed{ background: rgba(220,38,38,.85); color: #fff; }

.open-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,.8);
  animation: pulse-dot 1.6s infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }

/* ─ Info column ─ */
.info-col {
  flex: 1; padding: 18px 20px;
  display: flex; flex-direction: column; gap: 10px;
  min-width: 0;
}

.info-top { display: flex; flex-direction: column; gap: 7px; }

.name-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 12px; flex-wrap: wrap;
}

.venue-name {
  font-family: "Barlow Condensed", sans-serif;
  font-size: 1.15rem; font-weight: 800;
  letter-spacing: 0.01em; margin: 0; line-height: 1.2;
}

.name-link { color: var(--text); text-decoration: none; }
.name-link:hover { color: var(--green-dark); }

.bolt-icon { margin-right: 3px; font-style: normal; }

/* Rating */
.rating-row { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.stars { display: flex; gap: 1px; }
.star { color: #d1d5db; font-size: 12px; }
.star.filled { color: #f59e0b; }
.rating-val { font-weight: 700; font-size: 13px; color: var(--text); }
.review-count { font-size: 12px; color: var(--muted); }

/* Address */
.venue-address {
  display: flex; align-items: center; gap: 5px;
  font-style: normal; color: var(--muted);
  font-size: 12.5px; line-height: 1.4;
}
.venue-address svg { width: 12px; height: 12px; stroke: currentColor; fill: none; stroke-width: 2; flex-shrink: 0; }
.distance-chip {
  margin-left: 6px; background: #f3f4f6;
  border-radius: 999px; padding: 2px 8px;
  font-size: 11px; font-weight: 600; color: var(--muted);
  flex-shrink: 0;
}

/* Chips */
.chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: #f3f4f6; border-radius: 6px;
  padding: 4px 10px; font-size: 11.5px; font-weight: 600;
  color: #374151;
}
.chip svg { width: 10px; height: 10px; stroke: currentColor; fill: none; stroke-width: 2; }
.chip--sport { background: var(--green-light); color: #166534; }

/* Pricing tiers */
.pricing-tiers {
  display: flex; flex-wrap: wrap; gap: 8px;
  padding: 10px 14px;
  background: #f9fafb; border-radius: 8px;
  border: 1px solid var(--border);
}
.tier {
  display: flex; flex-direction: column; gap: 2px;
  min-width: 80px;
}
.tier-label { font-size: 10px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
.tier-price { font-family: "Barlow Condensed", sans-serif; font-size: 1rem; font-weight: 800; color: var(--text); }
.tier-price small { font-size: 0.65em; font-weight: 600; color: var(--muted); margin-left: 1px; }

.pricing-simple { display: flex; align-items: baseline; gap: 6px; }
.price-from { font-size: 11px; color: var(--muted); }
.price-value { font-family: "Barlow Condensed", sans-serif; font-size: 1.2rem; font-weight: 800; color: #dc2626; }
.price-value small { font-size: 0.65em; font-weight: 600; color: var(--muted); }

/* Amenities */
.amenities-row {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-top: auto;
}
.amenity {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; color: var(--muted);
}
.amenity svg { width: 12px; height: 12px; stroke: currentColor; fill: none; stroke-width: 2; }

/* ─ CTA column ─ */
.cta-col {
  flex-shrink: 0; width: 160px; padding: 18px 16px;
  display: flex; flex-direction: column;
  gap: 10px; align-items: stretch;
  border-left: 1.5px solid var(--border);
  background: #fafafa;
}

/* Slots badge */
.slots-badge {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600;
  padding: 5px 9px; border-radius: 6px;
  background: #ecfdf5; color: #065f46;
}
.slots-badge--full { background: #fef2f2; color: #991b1b; }
.slot-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #16a34a; flex-shrink: 0;
  animation: pulse-dot 1.6s infinite;
}

/* CTA button */
.cta-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; border: none; border-radius: 8px;
  padding: 11px 12px; font-family: "Barlow Condensed", sans-serif;
  font-size: 12.5px; font-weight: 800; letter-spacing: 0.07em;
  text-decoration: none; cursor: pointer; text-align: center;
  transition: all .2s ease;
}

.cta-btn--book {
  background: var(--green); color: #fff;
}
.cta-btn--book svg { width: 12px; height: 12px; fill: #fff; flex-shrink: 0; }
.cta-btn--book:hover {
  background: var(--green-dark);
  box-shadow: 0 6px 18px rgba(61,213,109,.4);
  transform: translateY(-1px);
}

.cta-btn--view {
  background: #fff; color: var(--text);
  border: 1.5px solid var(--border);
}
.cta-btn--view:hover { border-color: var(--text); }

/* Favorite button */
.fav-btn {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  background: none; border: 1.5px solid var(--border);
  border-radius: 8px; padding: 8px; font-size: 12px;
  font-weight: 600; color: var(--muted); cursor: pointer;
  transition: all .2s;
}
.fav-btn svg { width: 13px; height: 13px; stroke: currentColor; fill: none; stroke-width: 2; transition: fill .2s; }
.fav-btn:hover { border-color: #f43f5e; color: #f43f5e; }
.fav-btn.active { color: #f43f5e; border-color: #fecdd3; background: #fff1f2; }
.fav-btn.active svg { fill: #f43f5e; stroke: #f43f5e; }

/* Partner note */
.partner-note {
  display: flex; align-items: center; gap: 4px;
  font-size: 10.5px; color: #15803d; font-weight: 600;
  margin: 0; text-align: center; justify-content: center;
}
.partner-note svg { width: 11px; height: 11px; stroke: #16a34a; fill: none; stroke-width: 2.5; flex-shrink: 0; }

/* ══ PROMO CARD ══ */
.promo-card {
  position: relative; border-radius: var(--radius); overflow: hidden;
  min-height: 200px;
}
.promo-bg { width: 100%; height: 200px; object-fit: cover; display: block; }
.promo-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.4) 100%);
  display: flex; flex-direction: column;
  justify-content: center; padding: 24px 28px; gap: 8px;
}
.promo-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); }
.promo-title { font-family: "Barlow Condensed", sans-serif; font-size: 1.6rem; font-weight: 900; color: #fff; margin: 0; }
.promo-sub { font-size: 12.5px; color: rgba(255,255,255,.75); margin: 0; }
.promo-cta {
  display: inline-block; background: var(--green); color: #fff;
  border-radius: 6px; padding: 8px 18px; font-weight: 700;
  font-size: 12.5px; text-decoration: none; align-self: flex-start;
  margin-top: 4px; transition: background .2s;
}
.promo-cta:hover { background: var(--green-dark); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .card-body { flex-direction: column; }
  .image-col { width: 100%; }
  .image-wrap { min-height: 200px; }
  .cta-col {
    width: 100%; flex-direction: row; flex-wrap: wrap;
    border-left: none; border-top: 1.5px solid var(--border);
    align-items: center;
  }
  .cta-btn { flex: 1; }
}
</style>