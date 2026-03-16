<template>
  <div
    class="venue-card"
    :class="{
      'venue-card--partner': venue.isPartner,
      'venue-card--promo': venue.isPromo,
    }"
  >
    <!-- Partner badge -->
    <!-- <div v-if="venue.isPartner" class="partner-badge">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#16a34a" />
        <path d="M8 12l3 3 5-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      CLB ĐỐI TÁC
    </div> -->

    <div class="venue-card__body">

      <!-- ── IMAGE ── -->
      <div class="venue-card__image-wrap">
        <img
          :src="venue.image"
          :alt="`Sân ${venue.name} tại ${venue.address}`"
          class="venue-card__image"
          loading="lazy"
        />

        <!-- HOT / NEW tag -->
        <span v-if="venue.isHot" class="status-tag status-tag--hot">HOT</span>
        <span v-if="venue.isNew" class="status-tag status-tag--new">NEW</span>

        <!-- Slider -->
        <div v-if="venue.hasSlider" class="slider-controls">
          <button class="slider-btn">‹</button>
          <button class="slider-btn">›</button>
        </div>

        <!-- Promo overlay -->
        <div v-if="venue.isPromo" class="promo-overlay">
          <h3 class="promo-title">⚡ {{ venue.name }}</h3>
        </div>
      </div>

      <!-- ── INFO ── -->
      <div v-if="!venue.isPromo" class="venue-card__info">
        <div class="info-top">

          <!-- Name + Rating -->
          <div class="venue-card__header">
            <h2 class="venue-card__name">
              <span v-if="venue.hasOnlineBooking" class="bolt-inline" title="Đặt sân nhanh">⚡</span>
              {{ venue.name }}
            </h2>
            <div v-if="venue.rating" class="venue-rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span class="stars">{{ venue.rating }}</span>
              <span class="reviews">({{ venue.reviewCount }})</span>
            </div>
          </div>

          <!-- Address -->
          <p class="venue-card__address">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {{ venue.address }}
          </p>

          <!-- Detail chips -->
          <div class="detail-chips">
            <span v-if="venue.format" class="chip">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              {{ venue.format }}
            </span>
            <span v-if="venue.surface" class="chip">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              {{ venue.surface }}
            </span>
            <span v-if="venue.type" class="chip">{{ venue.type }}</span>
          </div>
        </div>

        <!-- Amenities -->
        <div class="venue-card__amenities">
          <span v-if="venue.distance !== undefined" class="amenity">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ venue.distance === 0 ? '0' : venue.distance }} km
          </span>
          <span v-if="venue.changingRoom" class="amenity amenity--feature">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Phòng thay đồ
          </span>
          <span v-if="venue.freeParking" class="amenity amenity--feature">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
            </svg>
            Đỗ xe miễn phí
          </span>
          <span v-if="venue.wifi" class="amenity amenity--feature">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <circle cx="12" cy="20" r="1" fill="currentColor"/>
            </svg>
            Wifi
          </span>
        </div>
      </div>

      <!-- ── CTA ── -->
      <div v-if="!venue.isPromo" class="venue-card__cta">
        <!-- Pricing -->
        <div v-if="venue.price" class="pricing-wrap">
          <span class="price-label">Giá từ</span>
          <div class="price-value">
            {{ formatPrice(venue.price) }}<small>/h</small>
          </div>
        </div>

        <!-- Button -->
        <button
          class="cta-btn"
          :class="venue.hasOnlineBooking ? 'cta-btn--booking' : 'cta-btn--explore'"
          @click="goToDetail"
        >
          <svg v-if="venue.hasOnlineBooking" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          {{ venue.hasOnlineBooking ? 'ĐẶT SÂN NGAY' : 'XEM CHI TIẾT' }}
        </button>

        <!-- Available slots -->
        <div v-if="venue.availableSlots" class="available-slots">
          <span class="dot"></span>
          {{ venue.availableSlots }}
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'VenueCard',
  props: {
    venue: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatPrice(value) {
      if (!value) return 'Liên hệ'
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(value)
    },
    goToDetail() {
      this.$router.push(`/venue/${this.venue.id}`)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800;900&display=swap');

/* ════════════════════════════════
   BASE CARD
════════════════════════════════ */
.venue-card {
  font-family: 'Barlow', sans-serif;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: box-shadow 0.25s, transform 0.25s;
}

.venue-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.venue-card--partner {
  border: 2px solid #16a34a;
}

.venue-card--promo {
  border: none;
}

/* ════════════════════════════════
   PARTNER BADGE
════════════════════════════════ */
.partner-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f0fdf4;
  border: 1.5px solid #16a34a;
  color: #16a34a;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 11.5px;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  margin: 10px 0 0 10px;
  border-radius: 4px;
}

/* ════════════════════════════════
   CARD BODY GRID
════════════════════════════════ */
.venue-card__body {
  display: grid;
  grid-template-columns: 240px 1fr 200px;
  min-height: 168px;
}

.venue-card--promo .venue-card__body {
  grid-template-columns: 1fr;
  min-height: 200px;
}

/* ════════════════════════════════
   IMAGE
════════════════════════════════ */
.venue-card__image-wrap {
  position: relative;
  overflow: hidden;
  min-height: 168px;
}

.venue-card--promo .venue-card__image-wrap {
  min-height: 200px;
  height: 100%;
}

.venue-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.venue-card:hover .venue-card__image {
  transform: scale(1.04);
}

.venue-card--promo .venue-card__image {
  filter: brightness(0.48);
}

/* Status tags */
.status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
  padding: 3px 9px;
  border-radius: 3px;
  z-index: 2;
}
.status-tag--hot { background: #ef4444; color: white; }
.status-tag--new { background: #0891b2; color: white; }

/* Slider */
.slider-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 6px;
  pointer-events: none;
}

.slider-btn {
  pointer-events: all;
  background: rgba(0, 0, 0, 0.42);
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.slider-btn:hover { background: rgba(0, 0, 0, 0.68); }

/* Promo overlay */
.promo-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  pointer-events: none;
}

.promo-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 30px;
  font-weight: 900;
  color: white;
  letter-spacing: 1px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  text-align: center;
  padding: 0 20px;
}

/* ════════════════════════════════
   INFO
════════════════════════════════ */
.venue-card__info {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
  border-right: 1px solid #f1f5f9;
}

.info-top {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.venue-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.venue-card__name {
  font-size: 16px;
  font-weight: 700;
  color: #16a34a;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.bolt-inline { font-size: 15px; }

/* Rating pill */
.venue-rating {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 4px;
  padding: 2px 7px;
}

.stars {
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
}

.reviews {
  font-size: 11px;
  color: #a16207;
}

/* Address */
.venue-card__address {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.45;
}

.venue-card__address svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #94a3b8;
}

/* Detail chips */
.detail-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 11.5px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 20px;
}

/* Amenities */
.venue-card__amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
  margin-top: 10px;
}

.amenity {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.amenity--feature { color: #475569; }
.amenity svg { color: #94a3b8; flex-shrink: 0; }

/* ════════════════════════════════
   CTA
════════════════════════════════ */
.venue-card__cta {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 10px;
}

/* Pricing */
.pricing-wrap {
  text-align: center;
  padding: 6px 0 8px;
  border-bottom: 1px solid #f1f5f9;
}

.price-label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.price-value {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 22px;
  font-weight: 900;
  color: #ef4444;
  line-height: 1;
}

.price-value small {
  font-family: 'Barlow', sans-serif;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 400;
  margin-left: 1px;
}

/* CTA button */
.cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 1px;
  padding: 12px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  width: 100%;
}

.cta-btn:active { transform: scale(0.98); }

.cta-btn--explore { background: #16a34a; color: white; }
.cta-btn--explore:hover { background: #15803d; }

.cta-btn--booking { background: #1e2a4a; color: white; }
.cta-btn--booking:hover { background: #162039; }

/* Available slots */
.available-slots {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
  line-height: 1.4;
}

.dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
  70%  { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* ════════════════════════════════
   RESPONSIVE
════════════════════════════════ */
@media (max-width: 900px) {
  .venue-card__body {
    grid-template-columns: 1fr;
  }

  .venue-card__image-wrap {
    min-height: 200px;
  }

  .venue-card__info {
    border-right: none;
    border-bottom: 1px solid #f1f5f9;
  }

  .venue-card__cta {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    padding: 12px 16px 16px;
    gap: 12px;
  }

  .pricing-wrap {
    border-bottom: none;
    text-align: left;
    flex: 1;
    padding: 0;
  }

  .cta-btn {
    width: auto;
    flex-shrink: 0;
  }
}
</style>