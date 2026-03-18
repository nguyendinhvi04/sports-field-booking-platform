<template>
  <div class="lock-overlay">
    <div class="lock-card">
      <!-- Animated Lock Icon -->
      <div class="lock-icon-wrapper">
        <div class="lock-pulse"></div>
        <span class="material-icons lock-icon">lock</span>
      </div>

      <!-- Content -->
      <h2 class="lock-title">Tính năng bị khóa</h2>
      <p class="lock-subtitle">
        Hoàn thiện hồ sơ để mở khóa <strong>{{ featureName }}</strong> và tất cả các tính năng quản lý sân bóng của bạn.
      </p>

      <!-- Benefits list -->
      <ul class="benefits-list">
        <li v-for="b in benefits" :key="b">
          <span class="material-icons benefit-icon">check_circle</span>
          {{ b }}
        </li>
      </ul>

      <!-- CTA -->
      <router-link to="/owner/settings" class="cta-btn">
        <span class="material-icons">edit_note</span>
        Cập nhật hồ sơ ngay
      </router-link>
      <p class="cta-hint">Chỉ mất khoảng 3 phút để hoàn thiện.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeatureLockOverlay',
  props: {
    featureName: {
      type: String,
      default: 'tính năng này'
    }
  },
  data() {
    return {
      benefits: [
        'Nhận đơn đặt sân trực tuyến',
        'Quản lý lịch & thu tiền tự động',
        'Báo cáo doanh thu chi tiết',
        'Hệ thống CRM khách hàng',
        'Nhận thanh toán về tài khoản ngân hàng',
      ]
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');

.lock-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(241, 245, 249, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 24px;
  border-radius: inherit;
}

.lock-card {
  background: white;
  border-radius: 28px;
  padding: 48px 40px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(15, 22, 35, 0.1);
  border: 1px solid #eaecf2;
  animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Lock Icon */
.lock-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px; height: 80px;
  margin: 0 auto 24px;
}

.lock-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #fef9c3;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 0; }
}

.lock-icon {
  position: relative;
  z-index: 1;
  font-size: 40px;
  color: #f59e0b;
  background: #fef3c7;
  width: 80px; height: 80px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* Text */
.lock-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lock-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 28px;
}

.lock-subtitle strong { color: #1e293b; }

/* Benefits */
.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #475569;
}

.benefit-icon {
  font-size: 18px;
  color: #16a34a;
  flex-shrink: 0;
}

/* CTA */
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  text-decoration: none;
  padding: 16px 32px;
  border-radius: 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.25);
  width: 100%;
  justify-content: center;
  margin-bottom: 12px;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(22, 163, 74, 0.35);
}

.cta-hint {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}
</style>
