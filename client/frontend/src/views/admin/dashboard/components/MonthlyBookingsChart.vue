<template>
  <div class="chart-card glass-chart">
    <div class="chart-header">
      <div class="header-left">
        <div class="chart-title">Thống kê lượt đặt sân</div>
        <div class="chart-info">Số lượng giao dịch thành công trong 6 tháng</div>
      </div>
      <div class="header-right">
        <div class="trend-indicator up">
           <span class="material-icons">trending_up</span>
           <span>+12.5%</span>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <svg viewBox="0 0 500 200" class="main-svg">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.3" />
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="var(--accent)" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>

        <!-- Tooltip Line or Guides can go here (Optional) -->
        <g class="grid-lines">
          <line x1="0" y1="180" x2="500" y2="180" stroke="var(--border)" stroke-dasharray="4,4" />
          <line x1="0" y1="90" x2="500" y2="90" stroke="var(--border)" stroke-dasharray="4,4" />
        </g>

        <!-- Area Fill -->
        <path :d="areaPath" fill="url(#areaGradient)" class="area-path" />

        <!-- Line Path -->
        <path :d="linePath" fill="none" stroke="url(#lineGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="line-path" />

        <!-- Data Points -->
        <g v-for="(p, i) in points" :key="i" class="point-group">
          <circle :cx="p.x" :cy="p.y" r="4" fill="var(--bg-secondary)" stroke="var(--accent)" stroke-width="2" class="data-point" />
          <text :x="p.x" :y="p.y - 12" text-anchor="middle" class="point-label">{{ values[i] }}</text>
        </g>
      </svg>
    </div>

    <div class="months-axis">
      <div v-for="m in months" :key="m" class="axis-label">{{ m }}</div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'MonthlyBookingsChart',
  props: {
    months: { type: Array, required: true },
    values: { type: Array, required: true }
  },
  setup(props) {
    // Normalize coordinates
    const points = computed(() => {
      const maxVal = Math.max(...props.values, 100);
      const width = 500;
      const height = 180;
      const step = width / (props.months.length - 1);
      
      return props.values.map((v, i) => ({
        x: i * step,
        y: height - (v / maxVal * height) + 10 // Offset from bottom
      }));
    });

    const linePath = computed(() => {
      if (points.value.length === 0) return '';
      // Bezier curve or Simple Line
      // Simple L-path for now (Can use Bezier if needed)
      return points.value.reduce((path, p, i) => {
        return path + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
      }, '');
    });

    const areaPath = computed(() => {
      if (points.value.length === 0) return '';
      const first = points.value[0];
      const last = points.value[points.value.length - 1];
      let path = linePath.value;
      path += ` L ${last.x} 190 L ${first.x} 190 Z`;
      return path;
    });

    return { points, linePath, areaPath };
  }
}
</script>

<style scoped>
.glass-chart { 
  background: var(--bg-secondary); 
  border: 1px solid var(--border); 
  border-radius: var(--radius-lg); 
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
.chart-title { font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
.chart-info { font-size: 11px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

.trend-indicator { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }
.trend-indicator.up { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.trend-indicator span.material-icons { font-size: 14px; }

.chart-container { height: 200px; width: 100%; position: relative; }
.main-svg { overflow: visible; width: 100%; height: 100%; }

.line-path { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 2s ease forwards; }
@keyframes drawLine { to { stroke-dashoffset: 0; } }

.area-path { opacity: 0; animation: fadeIn 1s ease 1s forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.point-label { font-size: 10px; font-weight: 800; fill: var(--accent); opacity: 0; transition: opacity 0.3s; }
.point-group:hover .point-label { opacity: 1; }
.data-point { transition: r 0.2s; cursor: pointer; }
.data-point:hover { r: 6; }

.months-axis { display: flex; justify-content: space-between; margin-top: 16px; padding: 0 5px; }
.axis-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

/* Dark mode adjustments */
:root[data-theme='dark'] .axis-label { color: rgba(255,255,255,0.4); }
</style>
