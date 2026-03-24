<template>
  <section class="services-section" :class="{ 'visible': visible }" ref="sectionRef">
    <div class="bg-dots" />

    <div class="container">
      <!-- Header -->
      <div class="section-header">
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>

      <!-- Feature Cards -->
      <div class="features-grid">
        <div
          v-for="(service, index) in services"
          :key="index"
          class="feature-card"
          :style="{ transitionDelay: `${0.2 + index * 0.15}s` }"
        >
          <div class="icon-wrap">
            <svg viewBox="0 0 24 24" v-html="service.iconPath" />
          </div>
          <h3 class="card-title">{{ service.title }}</h3>
          <p class="card-desc">{{ service.description }}</p>
          <button class="btn-find" @click="handleClick(service)">
            {{ service.btnText }}
          </button>
        </div>
      </div>

      <!-- Bottom strip -->
      <div class="bottom-strip" />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const title = ref('DỊCH VỤ CỦA CHÚNG TÔI')
const subtitle = ref(
  "Những dịch vụ tiện ích từ chúng tôi giúp bạn có trải nghiệm tốt nhất khi đặt sân."
)

const services = ref([
  {
    title: 'Đặt Sân Bóng Đá',
    description: 'Đặt sân bóng đá dễ dàng với nhiều lựa chọn thời gian và địa điểm.',
    btnText: 'ĐẶT NGAY',
    iconPath: `
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="12 6 7.5 10 9 16 15 16 16.5 10"></polygon>
      <line x1="12" y1="6" x2="12" y2="2"></line>
      <line x1="7.5" y1="10" x2="3.5" y2="8"></line>
      <line x1="16.5" y1="10" x2="20.5" y2="8"></line>
      <line x1="9" y1="16" x2="6" y2="20"></line>
      <line x1="15" y1="16" x2="18" y2="20"></line>
    `
  },
  {
    title: 'Sân Tennis',
    description: 'Sân tennis chất lượng cao cho mọi cấp độ người chơi.',
    btnText: 'XEM CHI TIẾT',
    iconPath: `
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2a15 15 0 0 1 0 20M2 12h20M12 2a15 15 0 0 0 0 20"></path>
    `
  },
  {
    title: 'Tiện ích & Dịch Vụ',
    description: 'Bãi đỗ xe rộng rãi, wifi miễn phí, và dịch vụ hỗ trợ khách hàng chu đáo.',
    btnText: 'TÌM HIỂU THÊM',
    iconPath: `
      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    `
  }
])

const visible = ref(false)
const sectionRef = ref(null)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.1 }
  )
  
  if (sectionRef.value) {
    observer.observe(sectionRef.value)
  }
})

const handleClick = (service) => {
  console.log('Clicked:', service.title)
}
</script>

<style scoped>
/* ── CSS Variables ── */
.services-section {
  --green: rgb(22, 163, 74);
  --green-dark: rgb(15, 118, 52);
  --green-glow: rgba(22, 163, 74, 0.12);
  --text-dark: #1a1a2e;
  --text-muted: #555566;

  position: relative;
  background: var(--bg);
  padding: 80px 20px;
  font-family: 'Barlow', sans-serif;
  overflow: hidden;
}

/* ── Dot-grid background ── */
.bg-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #d0d3db 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.45;
  pointer-events: none;
}

/* ── Container ── */
.container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Section Header ── */
.section-header {
  text-align: center;
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.services-section.visible .section-header {
  opacity: 1;
  transform: translateY(0);
}

.section-header h2 {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dark);
  margin-bottom: 18px;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ── Grid ── */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

/* ── Card ── */
.feature-card {
  background: var(--card-bg);
  border: none;
  border-radius: 30px;
  padding: 50px 36px 45px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: default;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(40px);
  box-shadow: 15px 15px 30px #bebebe, -15px -15px 30px #ffffff;
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease, box-shadow 0.3s ease;
}

.services-section.visible .feature-card {
  opacity: 1;
  transform: translateY(0);
}

.feature-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--green);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.35s ease;
}

.feature-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff !important;
}

.feature-card:hover::after {
  transform: scaleX(1);
}

/* ── Icon ── */
.icon-wrap {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: var(--green-glow);
  border: 1.5px solid rgba(22, 163, 74, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  transition: all 0.4s ease;
}

.feature-card:hover .icon-wrap {
  background: rgba(22, 163, 74, 0.2);
  transform: scale(1.1) rotate(-5deg);
}

.icon-wrap svg {
  width: 32px;
  height: 32px;
  stroke: var(--text-dark);
  stroke-width: 1.6;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ── Card Title ── */
.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
  position: relative;
  padding-bottom: 15px;
}

.card-title::after {
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

/* ── Description ── */
.card-desc {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.7;
  margin-top: 20px;
  margin-bottom: 35px;
  flex: 1;
}

/* ── Button ── */
.btn-find {
  display: inline-block;
  background: var(--green);
  color: #fff;
  font-family: 'Barlow', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-find:hover {
  background: var(--green-dark);
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(22, 163, 74, 0.2);
}

.btn-find:active {
  transform: scale(0.98);
}

/* ── Bottom Strip ── */
.bottom-strip {
  margin-top: 80px;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--green) 0%, rgb(34, 197, 94) 50%, var(--green) 100%);
  opacity: 0.6;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .services-section { padding: 80px 20px; }
  .feature-card { padding: 40px 24px 35px; }
  .section-header h2 { font-size: 24px; }
}
</style>
