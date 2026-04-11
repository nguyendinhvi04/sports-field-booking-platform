<template>
  <div class="stat-card">
    <div class="stat-card-header">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-icon" :style="{background: bg, color: color}">
        <component :is="iconComponent" :size="16" />
      </div>
    </div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-change" :class="trend === 'up' ? 'up' : 'down'">
      <component :is="trend === 'up' ? 'TrendingUp' : 'TrendingDown'" :size="12" class="trend-icon" />
      {{ change }}
    </div>
  </div>
</template>

<script>
import { TrendingUp, TrendingDown } from 'lucide-vue-next';

export default {
  name: 'DashboardStatCard',
  components: {
    TrendingUp, TrendingDown
  },
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    change: { type: String, required: true },
    trend: { type: String, default: 'up' },
    bg: { type: String, default: 'var(--bg-tertiary)' },
    color: { type: String, default: 'var(--text-primary)' },
    iconComponent: { type: [Object, Function], required: true }
  }
}
</script>

<style scoped>
.stat-card { 
  background: var(--bg-secondary); 
  border: 1px solid var(--border); 
  border-radius: var(--radius-lg); 
  padding: 18px 20px; 
  transition: all 0.2s; 
}
.stat-card:hover { 
  border-color: var(--border-light); 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
}
.stat-card-header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  margin-bottom: 12px; 
}
.stat-label { 
  font-size: 11px; 
  color: var(--text-muted); 
  font-weight: 600; 
  text-transform: uppercase; 
  letter-spacing: 0.05em; 
}
.stat-icon { 
  width: 32px; 
  height: 32px; 
  border-radius: 8px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.stat-value { 
  font-family: 'Barlow', sans-serif; 
  font-size: 26px; 
  font-weight: 700; 
  line-height: 1; 
  margin-bottom: 6px; 
  color: var(--text-primary); 
}
.stat-change { 
  font-size: 11px; 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  font-weight: 500; 
}
.stat-change.up { color: var(--green); }
.stat-change.down { color: var(--red); }
.trend-icon { flex-shrink: 0; }
</style>
