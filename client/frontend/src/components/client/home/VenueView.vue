<template>
  <section class="playfinder-section" :class="{ 'visible': visible }" ref="sectionRef">
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
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
          :style="{ transitionDelay: `${0.2 + index * 0.15}s` }"
        >
          <div class="icon-wrap">
            <svg viewBox="0 0 24 24" v-html="feature.iconPath" />
          </div>
          <h3 class="card-title">{{ feature.title }}</h3>
          <p class="card-desc">{{ feature.description }}</p>
          <button class="btn-find" @click="handleClick(feature)">
            Tìm hiểu thêm
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

const title = ref('Nền tảng dành cho các chủ cơ sở thể thao')
const subtitle = ref(
  "Cho dù bạn là hội đồng, trường học, nhóm cộng đồng hay trung tâm giải trí, việc trở thành Đối tác của Playfinder có thể mang lại lợi ích cho địa điểm thể thao của bạn theo nhiều cách."
)

const features = ref([
  {
    title: 'Đặt chỗ trực tuyến',
    description:
      'Chúng tôi cho phép các địa điểm nhận đặt chỗ trực tuyến, dẫn đến tỷ lệ chuyển đổi đặt chỗ và doanh thu tăng lên.',
    iconPath: `
      <polyline points="13 2 13 9 20 9"/>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
      <line x1="9" y1="11" x2="11" y2="11"/>
    `
  },
  {
    title: 'Chuyên môn Marketing',
    description:
      'Tận dụng các chiến dịch marketing của Playfinder giúp địa điểm của bạn tăng cường sự hiện diện trên nhiều kênh.',
    iconPath: `
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    `
  },
  {
    title: 'Hỗ trợ vận hành',
    description:
      'Chúng tôi quản lý tất cả các thắc mắc qua email và điện thoại, cũng như các hóa đơn và danh sách chờ đặt chỗ hàng loạt.',
    iconPath: `
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.93-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    `
  }
])

const visible = ref(false);
const sectionRef = ref(null);

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true;
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );
  
  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }
});

const handleClick = (feature) => {
  console.log('Clicked:', feature.title)
  // TODO: navigate or emit event
  // emit('feature-click', feature)
}
</script>

<style scoped>
/* ── CSS Variables ── */
.playfinder-section {
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

.playfinder-section.visible .section-header {
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

.playfinder-section.visible .feature-card {
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
  .playfinder-section { padding: 80px 20px; }
  .feature-card { padding: 40px 24px 35px; }
  .section-header h2 { font-size: 24px; }
}
</style>