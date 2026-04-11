<template>
  <div class="page">
    <div class="page-header">
      <div class="header-left">
        <div class="page-title">
          <BarChart3 :size="24" class="title-icon" />
          Thống kê hệ thống
        </div>
        <div class="page-subtitle">Phân tích chi tiết lưu lượng, tăng trưởng và hành vi người dùng</div>
      </div>
      
      <div class="header-actions">
        <div class="date-picker-group">
           <CalendarDays :size="16" />
           <select v-model="selectedRange" class="range-select">
              <option value="7">7 ngày qua</option>
              <option value="30">30 ngày qua</option>
              <option value="90">3 tháng qua</option>
              <option value="365">1 năm qua</option>
           </select>
        </div>
        <button class="btn-refresh" @click="handleRefresh"><RefreshCw :size="14" :class="{spinning: loading}" /> Làm mới</button>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="stats-grid">
      <!-- User Growth -->
      <div class="stat-card span-2">
         <div class="card-header">
            <h4>Tăng trưởng Người dùng & Owner</h4>
            <span class="badge success">+12% vs tháng trước</span>
         </div>
         <div class="chart-box main-area">
            <!-- Smooth Area Chart SVG -->
            <svg viewBox="0 0 800 200" class="svg-chart">
               <path d="M0 150 Q 100 120, 200 140 T 400 80 T 600 100 T 800 40" fill="none" stroke="var(--accent)" stroke-width="3" />
               <path d="M0 150 Q 100 120, 200 140 T 400 80 T 600 100 T 800 40 L 800 200 L 0 200 Z" fill="rgba(var(--accent-rgb), 0.1)" />
            </svg>
         </div>
         <div class="chart-labels">
            <span v-for="m in months" :key="m">{{ m }}</span>
         </div>
      </div>

      <!-- Role Distribution -->
      <div class="stat-card">
         <div class="card-header">
            <h4>Phân bổ vai trò</h4>
         </div>
         <div class="donut-chart-container">
            <div class="donut-chart">
               <div class="donut-inner">
                  <div class="donut-text">
                     <span class="d-val">2.4k</span>
                     <span class="d-lbl">Tài khoản</span>
                  </div>
               </div>
            </div>
            <div class="donut-legend">
               <div class="legend-item"><div class="dot user"></div> User: 85%</div>
               <div class="legend-item"><div class="dot owner"></div> Owner: 12%</div>
               <div class="legend-item"><div class="dot admin"></div> Admin: 3%</div>
            </div>
         </div>
      </div>

      <!-- Activity Heatmap Mockup -->
      <div class="stat-card span-3">
         <div class="card-header">
            <h4>Mật độ lượt đặt sân (7 ngày gần nhất)</h4>
         </div>
         <div class="activity-grid">
            <div v-for="day in 7" :key="day" class="activity-day">
               <div class="day-label">{{ ['T2','T3','T4','T5','T6','T7','CN'][day-1] }}</div>
               <div class="hour-blocks">
                  <div v-for="h in 24" :key="h" 
                    class="hour-block" 
                    :style="{opacity: Math.random()}"
                    :title="`Giờ: ${h}h - Mật độ: ${Math.floor(Math.random()*100)}%`"
                  ></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { BarChart3, CalendarDays, RefreshCw } from 'lucide-vue-next';

export default {
  name: 'SystemStatsView',
  components: { BarChart3, CalendarDays, RefreshCw },
  setup() {
    const selectedRange = ref('30');
    const loading = ref(false);
    const months = ['T10', 'T11', 'T12', 'T1', 'T2', 'T3'];

    const handleRefresh = () => {
      loading.value = true;
      setTimeout(() => { loading.value = false; }, 1000);
    };

    return { selectedRange, loading, months, handleRefresh };
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
.title-icon { color: var(--accent); }

.date-picker-group { display: flex; align-items: center; gap: 8px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; padding: 0 12px; height: 36px; color: var(--text-muted); }
.range-select { background: transparent; border: none; outline: none; font-size: 13px; font-weight: 600; color: var(--text-primary); cursor: pointer; }

.btn-refresh { display: flex; align-items: center; gap: 8px; background: transparent; border: 1px solid var(--border); border-radius: 8px; padding: 0 12px; height: 36px; font-size: 13px; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
.btn-refresh:hover { background: var(--bg-hover); color: var(--accent); border-color: var(--accent); }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.stat-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; }
.span-2 { grid-column: span 2; }
.span-3 { grid-column: span 3; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.card-header h4 { font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0; }
.badge { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 100px; }
.badge.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

.chart-box { height: 200px; width: 100%; position: relative; margin-bottom: 12px; }
.svg-chart { width: 100%; height: 100%; }
.chart-labels { display: flex; justify-content: space-between; padding: 0 10px; }
.chart-labels span { font-size: 10px; font-weight: 700; color: var(--text-muted); }

/* Donut Chart Mockup */
.donut-chart-container { display: flex; align-items: center; justify-content: center; gap: 30px; flex: 1; }
.donut-chart { 
  width: 120px; height: 120px; border-radius: 50%; 
  background: conic-gradient(var(--accent) 0% 85%, var(--orange) 85% 97%, var(--red) 97% 100%); 
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.donut-inner { width: 90px; height: 90px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; }
.donut-text { display: flex; flex-direction: column; align-items: center; }
.d-val { font-size: 18px; font-weight: 800; color: var(--text-primary); }
.d-lbl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }

.donut-legend { display: flex; flex-direction: column; gap: 8px; }
.legend-item { font-size: 12px; font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 2px; }
.dot.user { background: var(--accent); }
.dot.owner { background: var(--orange); }
.dot.admin { background: var(--red); }

/* Activity heatmap */
.activity-grid { display: flex; flex-direction: column; gap: 12px; }
.activity-day { display: flex; align-items: center; gap: 12px; }
.day-label { width: 30px; font-size: 11px; font-weight: 800; color: var(--text-muted); }
.hour-blocks { display: flex; gap: 3px; flex: 1; }
.hour-block { height: 18px; flex: 1; background: var(--accent); border-radius: 2px; cursor: pointer; transition: all 0.2s; }
.hour-block:hover { transform: scaleY(1.2); filter: brightness(1.2); }
</style>
