<template>
  <div class="row g-4 bg-white shadow-sm p-4 vdp-panel-container">
    <div class="col-lg-8">
      <h4 class="fw-black mb-3">Giới thiệu về {{ venue.name }}</h4>
      <p class="text-muted" style="line-height:1.8">{{ venue.description }}</p>

      <!-- GALLERY -->
      <div v-if="venueImages.length" class="vdp-gallery mt-4 mb-2">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="fw-bold mb-0">Hình ảnh sân</h5>
          <span class="text-muted small fw-semibold">{{ galleryIndex + 1 }} / {{ venueImages.length }}</span>
        </div>
        <div class="vdp-gallery__main position-relative overflow-hidden mb-3" style="height:380px;background:#0f172a;">
          <transition name="gfade" mode="out-in">
            <img :key="galleryIndex" :src="venueImages[galleryIndex]?.url" :alt="venueImages[galleryIndex]?.caption" class="position-absolute w-100 h-100" style="object-fit:cover;top:0;left:0;"/>
          </transition>
          <div class="position-absolute bottom-0 start-0 end-0" style="height:110px;background:linear-gradient(to top,rgba(0,0,0,.72) 0%,transparent 100%);pointer-events:none;z-index:2"></div>
          <div class="position-absolute bottom-0 start-0 px-4 pb-3" style="z-index:3">
            <span class="text-white fw-semibold d-flex align-items-center gap-2" style="font-size:14px;text-shadow:0 1px 6px rgba(0,0,0,.6)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              {{ venueImages[galleryIndex]?.caption || 'Ảnh không có mô tả' }}
            </span>
          </div>
          <div class="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center gap-1 pb-3" style="z-index:3;pointer-events:none">
            <span v-for="(_,i) in venueImages" :key="i" class="vdp-gal-dot" :class="{'vdp-gal-dot--active':i===galleryIndex}"></span>
          </div>
          <button class="vdp-gal-nav vdp-gal-nav--prev" @click="prevImage"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button class="vdp-gal-nav vdp-gal-nav--next" @click="nextImage"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
        <div class="d-flex gap-2 pb-1" style="overflow-x:auto;scrollbar-width:thin;scrollbar-color:#e2e8f0 transparent;">
          <div v-for="(img,i) in venueImages" :key="i" class="vdp-gal-thumb flex-shrink-0 overflow-hidden" :class="{'vdp-gal-thumb--active':i===galleryIndex}" @click="galleryIndex=i">
            <img :src="img.url" :alt="img.caption" style="width:100%;height:100%;object-fit:cover;display:block;"/>
          </div>
        </div>
      </div>

      <h5 class="fw-bold mt-4 mb-3">Tiện ích sân</h5>
      <div class="row g-2">
        <div v-for="a in venue.amenities" :key="a.id" class="col-6 d-flex align-items-center gap-2">
          <div class="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center" style="width:26px;height:26px;flex-shrink:0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span class="small">{{ a.name }}</span>
          <span v-if="a.price > 0" class="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style="font-size:10px">{{ formatPrice(a.price) }}</span>
          <span v-else class="text-muted" style="font-size:10px; font-style: italic;">Miễn phí</span>
        </div>
      </div>

      <h5 class="fw-bold mt-4 mb-3">Giờ mở cửa</h5>
      <div v-for="(d,i) in venue.openingHours" :key="d.day" :class="['d-flex justify-content-between px-3 py-2 rounded-2', i%2===1?'bg-light':'']">
        <span class="fw-semibold small">{{ d.day }}</span>
        <span class="fw-bold small" :class="d.isClosed?'text-danger':'text-success'">{{ d.isClosed?'Đóng cửa':`${d.open} – ${d.close}` }}</span>
      </div>

      <!-- BẢN ĐỒ VỊ TRÍ -->
      <h5 class="fw-bold mt-4 mb-3">Vị trí & Bản đồ</h5>
      <div class="mb-3 d-flex align-items-center gap-2 text-muted small fw-semibold" style="line-height: 1.5">
        <svg style="flex-shrink:0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        {{ venue.address }}
      </div>
      <div class="overflow-hidden border shadow-sm" style="border-radius:12px; height: 320px;">
        <iframe 
          v-if="venue.address"
          width="100%" 
          height="100%" 
          frameborder="0" 
          style="border:0"
          :src="`https://maps.google.com/maps?q=${encodeURIComponent(venue.address)}&hl=vi&z=15&output=embed`" 
          allowfullscreen>
        </iframe>
      </div>
    </div>
    
    <div class="col-lg-4">
      <div class="vdp-sidebar card border-0">
        <div class="card-header py-3"><span class="fw-bold text-white">Đặt sân ngay</span></div>
        <div class="card-body"><button class="btn btn-success w-100 fw-bold" @click="$emit('switch-to-booking')">Chọn khung giờ →</button></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VenueInfoTab',
  props: {
    venue: {
      type: Object,
      required: true
    },
    venueImages: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      galleryIndex: 0
    }
  },
  methods: {
    formatPrice(v) { return new Intl.NumberFormat('vi-VN',{maximumFractionDigits:0}).format(v); },
    prevImage() { this.galleryIndex=(this.galleryIndex-1+this.venueImages.length)%this.venueImages.length; },
    nextImage() { this.galleryIndex=(this.galleryIndex+1)%this.venueImages.length; }
  }
}
</script>
