<template>
  <div class="stat-card" :style="`--delay: ${delay}ms`">
    <div class="stat-top">
      <div class="stat-icon-wrap" :class="stat.color">
        <span class="material-icons">{{ stat.icon }}</span>
      </div>
      <span class="stat-badge" :class="stat.trend">
        <span class="material-icons badge-icon">{{ stat.trend === 'up' ? 'north_east' : 'south_east' }}</span>
        {{ stat.change }}%
      </span>
    </div>
    <p class="stat-label">{{ stat.label }}</p>
    <h3 class="stat-value">{{ stat.value }}</h3>
    <div class="stat-bar">
      <div class="stat-bar-fill" :class="stat.color" :style="`width: ${stat.fill}%`"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    stat: { type: Object, required: true },
    delay: { type: Number, default: 0 }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');

.stat-card {
  background: #ffffff;
  border: 1px solid #eaecf2;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 2px 16px rgba(15,22,35,0.06);
  transition: transform 0.25s, box-shadow 0.25s;
  animation: fadeSlideUp 0.5s ease both;
  animation-delay: var(--delay, 0ms);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(15,22,35,0.10);
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon-wrap {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
}
.stat-icon-wrap.green  { background: #ecfdf5; color: #059669; }
.stat-icon-wrap.blue   { background: #eff6ff; color: #2563eb; }
.stat-icon-wrap.teal   { background: #f0fdfa; color: #0d9488; }
.stat-icon-wrap.amber  { background: #fffbeb; color: #d97706; }

.stat-badge {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 12px; font-weight: 700;
}
.stat-badge.up   { background: #ecfdf5; color: #059669; }
.stat-badge.down { background: #fef2f2; color: #dc2626; }
.badge-icon { width: 12px; height: 12px; font-size: 12px; }

.stat-label {
  font-size: 13px; color: #4b5672; font-weight: 500;
  margin: 0;
}

.stat-value {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 22px; font-weight: 800;
  color: #0f1623;
  margin: 0; line-height: 1.2;
}

.stat-bar {
  height: 4px; background: #eaecf2;
  border-radius: 100px; overflow: hidden;
  margin-top: 4px;
}
.stat-bar-fill {
  height: 100%; border-radius: 100px;
  transition: width 1s ease;
}
.stat-bar-fill.green  { background: #059669; }
.stat-bar-fill.blue   { background: #2563eb; }
.stat-bar-fill.teal   { background: #0d9488; }
.stat-bar-fill.amber  { background: #d97706; }
</style>
