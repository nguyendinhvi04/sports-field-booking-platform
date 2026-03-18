<template>
  <div class="card quick-actions">
    <div class="card-header">
      <div class="card-title-group">
        <div class="card-title-dot"></div>
        <h3 class="card-title">Thao tác nhanh</h3>
      </div>
    </div>
    <div class="action-buttons">
      <button class="action-btn primary" @click="$emit('add-offline-booking')">
        <div class="action-btn-icon">
          <span class="material-icons abtn-svg">add_circle</span>
        </div>
        <span>Đặt sân hộ khách (Offline)</span>
        <span class="material-icons action-arrow">chevron_right</span>
      </button>
      <button class="action-btn secondary" @click="$emit('lock-court')">
        <div class="action-btn-icon muted">
          <span class="material-icons abtn-svg">lock</span>
        </div>
        <span>Khóa sân bảo trì</span>
        <span class="material-icons action-arrow">chevron_right</span>
      </button>
      <button class="action-btn secondary" @click="$emit('view-reports')">
        <div class="action-btn-icon muted">
          <span class="material-icons abtn-svg">bar_chart</span>
        </div>
        <span>Xem báo cáo tháng</span>
        <span class="material-icons action-arrow">chevron_right</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickActions',
  emits: ['add-offline-booking', 'lock-court', 'view-reports']
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@500;600&display=swap');

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

.action-buttons { display: flex; flex-direction: column; gap: 10px; }
.action-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 14px; border-radius: 12px;
  border: 1px solid #eaecf2; background: #ffffff;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600; color: #0f1623;
  text-align: left; transition: all 0.2s;
}
.action-btn:hover { border-color: #059669; background: #f0fdf9; }
.action-btn.primary { background: #059669; border-color: #059669; color: #ffffff; }
.action-btn.primary:hover { background: #047857; border-color: #047857; }

.action-btn-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.action-btn.secondary .action-btn-icon.muted { background: #f1f5f9; color: #4b5672; }
.abtn-svg { width: 16px; height: 16px; font-size: 16px; }
.action-arrow { width: 14px; height: 14px; font-size: 14px; color: inherit; opacity: 0.5; margin-left: auto; }
</style>
