<template>
  <div class="card court-status">
    <div class="card-header">
      <div class="card-title-group">
        <div class="card-title-dot"></div>
        <h3 class="card-title">Trạng thái sân</h3>
      </div>
      <span class="live-badge">
        <span class="live-dot"></span> Live
      </span>
    </div>
    <div class="court-list">
      <div v-for="court in courts" :key="court.id" class="court-item" :class="court.status">
        <div class="court-left">
          <div class="court-status-dot" :class="court.status"></div>
          <div>
            <p class="court-name">{{ court.name }}</p>
            <p class="court-session" v-if="court.session">{{ court.session }}</p>
          </div>
        </div>
        <span class="court-label" :class="court.status">{{ court.statusText }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourtStatus',
  props: {
    courts: { type: Array, required: true }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500;700&display=swap');

.card {
  background: #ffffff;
  border: 1px solid #eaecf2;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 16px rgba(15,22,35,0.06);
}

.card-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}

.card-title-group {
  display: flex; align-items: center; gap: 10px;
}
.card-title-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #059669;
}
.card-title {
  font-family: 'Syne', sans-serif;
  font-size: 16px; font-weight: 700; color: #0f1623;
  margin: 0;
}

.live-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700; color: #059669;
  background: #ecfdf5; padding: 4px 10px; border-radius: 100px;
}
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #059669;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.4); }
}

.court-list { display: flex; flex-direction: column; gap: 2px; }
.court-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px;
  border-radius: 12px;
  transition: background 0.15s;
}
.court-item:hover { background: #f8fafb; }

.court-left { display: flex; align-items: center; gap: 12px; }
.court-status-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}
.court-status-dot.occupied  { background: #ef4444; box-shadow: 0 0 0 3px #fee2e2; }
.court-status-dot.available { background: #059669; box-shadow: 0 0 0 3px #d1fae5; }
.court-status-dot.locked    { background: #94a3b8; box-shadow: 0 0 0 3px #f1f5f9; }

.court-name    { font-size: 13px; font-weight: 700; color: #0f1623; margin: 0; }
.court-session { font-size: 11px; color: #9aa3bc; margin: 2px 0 0; }

.court-label {
  font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 100px;
}
.court-label.occupied  { background: #fef2f2; color: #dc2626; }
.court-label.available { background: #ecfdf5; color: #059669; }
.court-label.locked    { background: #f1f5f9; color: #64748b; }
</style>
