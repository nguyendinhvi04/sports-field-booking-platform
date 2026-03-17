<template>
  <section class="fbp-section">
    <div class="bg-dots" />

    <div class="container">
      <!-- Find / Book / Play -->
      <div class="steps-grid">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="step-card"
          :style="{ animationDelay: `${i * 0.15}s` }"
        >
          <div class="step-icon">
            <svg viewBox="0 0 24 24" v-html="step.iconPath" />
          </div>
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-desc">{{ step.description }}</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid" ref="statsGrid">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          class="stat-card"
          :style="{ animationDelay: `${0.1 + i * 0.12}s` }"
          :class="{ visible: statsVisible }"
        >
          <span class="stat-number">{{ stat.display }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
            <!-- Bottom strip -->
      <div class="bottom-strip" />
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// ── Steps data ──────────────────────────────────────────────
const steps = ref([
  {
    title: 'TÌM KIẾM',
    description:
      "Bạn đang muốn chơi sau giờ làm việc, tổ chức đội bóng cuối tuần hay so tài trên sân đấu? Khám phá mạng lưới các cơ sở thể thao rộng lớn. Chỉ cần nhập vị trí, chọn môn thể thao và nhấn nút tìm kiếm.",
    iconPath: `
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    `
  },
  {
    title: 'ĐẶT SÂN',
    description:
      "Khi bạn đã tìm thấy sân đấu, phòng tập hoặc câu lạc bộ hoàn hảo, hãy đặt sân nhanh hơn và thanh toán dễ dàng hơn. Kết nối với địa điểm thông qua hệ thống để thực hiện đặt chỗ trực tuyến một cách tiện lợi.",
    iconPath: `
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="14" x2="8" y2="14"/>
      <line x1="12" y1="14" x2="12" y2="14"/>
      <line x1="16" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="8" y2="18"/>
      <line x1="12" y1="18" x2="12" y2="18"/>
    `
  },
  {
    title: 'TRẢI NGHIỆM',
    description:
      "Bạn đã tìm thấy sân đấu tuyệt vời và đặt sân dễ dàng, giờ là lúc để ra sân. Sân khấu đã sẵn sàng cho trận đấu kịch tính của bạn. Hãy cháy hết mình trên sân để tạo nên những kỷ niệm chiến thắng khó quên.",
    iconPath: `
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v6l-3 3"/>
      <path d="M12 13l3 3"/>
      <path d="M9 17l-2 3"/>
      <path d="M15 17l2 3"/>
    `
  }
])

// ── Stats data ───────────────────────────────────────────────
const statsData = [
  { target: 3250, label: 'SÂN BÓNG ĐÁ' },
  { target: 3050, label: 'SÂN TENNIS' },
  { target: 1050, label: 'SÂN CẦU LÔNG' },
  { target: 390,  label: 'SÂN SQUASH' }
]

const stats = reactive(
  statsData.map(s => ({ ...s, display: 0 }))
)

// ── Intersection Observer ────────────────────────────────────
const statsGrid = ref(null)
const statsVisible = ref(false)
let observer = null

const animateCount = (stat, duration = 1800) => {
  const start = performance.now()
  const step = (now) => {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    stat.display = Math.floor(eased * stat.target)
    if (progress < 1) requestAnimationFrame(step)
    else stat.display = stat.target
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !statsVisible.value) {
        statsVisible.value = true
        stats.forEach((stat, i) => {
          setTimeout(() => animateCount(stat), 120 + i * 140)
        })
        observer.disconnect()
      }
    },
    { threshold: 0.3 }
  )
  if (statsGrid.value) observer.observe(statsGrid.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
/* ── Variables ── */
.fbp-section {
  --green: rgb(22, 163, 74);
  --green-dark: rgb(15, 118, 52);
  --green-glow: rgba(22, 163, 74, 0.12);
  --text-dark: #1a1a2e;
  --text-muted: #555566;

  position: relative;
  background: #ffffff;
  padding: 100px 20px 120px;
  font-family: 'Barlow', sans-serif;
  overflow: hidden;
}
/* ── Bottom Strip ── */
.bottom-strip {
  margin-top: 80px;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--green) 0%, rgb(34, 197, 94) 50%, var(--green) 100%);
  opacity: 0.6;
}

/* ── Dot grid ── */
.bg-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #d0d3db 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.4;
  pointer-events: none;
}

/* ── Container ── */
.container {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

/* ════════════════════════════════════
   STEPS GRID
════════════════════════════════════ */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px 48px;
  margin-bottom: 72px;
}

.step-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeUp 0.6s ease both;
}

/* icon */
.step-icon {
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.step-card:hover .step-icon {
  transform: translateY(-4px) scale(1.08);
}

.step-icon svg {
  width: 40px;
  height: 40px;
  stroke: var(--text-dark);
  stroke-width: 1.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* title */
.step-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-dark);
  margin-bottom: 10px;
  position: relative;
  padding-bottom: 14px;
}

.step-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 3px;
  background: var(--green);
  border-radius: 2px;
}

/* description */
.step-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.75;
  margin-top: 16px;
  max-width: 340px;
}

/* ════════════════════════════════════
   STATS GRID
════════════════════════════════════ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

/* ── Stat card ── */
.stat-card {
  border: 2px solid var(--green);
  border-radius: 8px;
  padding: 28px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: var(--card-bg);
  position: relative;
  overflow: hidden;

  /* initial hidden state */
  opacity: 0;
  transform: translateY(30px) scale(0.96);
  transition:
    opacity 0.55s ease,
    transform 0.55s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}

/* entrance when visible */
.stat-card.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* staggered delays via inline style + transition-delay */
.stat-card:nth-child(1) { transition-delay: 0.10s; }
.stat-card:nth-child(2) { transition-delay: 0.22s; }
.stat-card:nth-child(3) { transition-delay: 0.34s; }
.stat-card:nth-child(4) { transition-delay: 0.46s; }

/* green shimmer sweep on enter */
.stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(61,213,109,0.12) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0s;
}

.stat-card.visible::before {
  animation: shimmer 0.9s ease forwards;
  animation-delay: inherit;
}

/* hover */
.stat-card:hover {
  box-shadow: 0 12px 36px rgba(61, 213, 109, 0.22);
  background: var(--green-glow);
}

/* number */
.stat-number {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--text-dark);
  letter-spacing: 0.02em;
  line-height: 1;

  /* pulse effect once visible */
  animation: none;
}

.stat-card.visible .stat-number {
  animation: pop 0.4s ease both;
  animation-delay: inherit;
}

/* label */
.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* ════════════════════════════════════
   KEYFRAMES
════════════════════════════════════ */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

@keyframes pop {
  0%   { transform: scale(0.8); }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .steps-grid { gap: 36px 0; }
  .stat-card  { padding: 22px 16px 18px; }
  .stat-number { font-size: 2rem; }
}
</style>