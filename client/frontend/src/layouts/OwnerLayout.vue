<template>
  <div class="owner-layout">
    <OwnerSidebar :is-collapsed="isSidebarCollapsed" :is-locked="isLocked" :is-kyc-approved="isKycApproved" />
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <OwnerHeader @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />
      
      <!-- Banner 1: Trial countdown (chưa nộp hồ sơ) -->
      <transition name="banner-slide">
        <div v-if="!isVerified && !isTrialExpired" class="trial-banner">
          <div class="trial-banner-left">
            <span class="material-icons">timer</span>
            <span>Bạn đang dùng thử miễn phí. Hồ sơ bị khóa sau: <strong>{{ timeLeftFormatted }}</strong></span>
          </div>
          <div class="trial-progress">
            <div class="trial-bar" :style="{ width: trialPercent + '%' }"></div>
          </div>
          <router-link to="/owner/settings" class="trial-cta">
            <span class="material-icons">edit_note</span> Cập nhật hồ sơ
          </router-link>
        </div>
      </transition>

      <!-- Banner 2: Đang chờ Admin duyệt KYC (PENDING) -->
      <transition name="banner-slide">
        <div v-if="isPendingReview" class="trial-banner pending-banner">
          <div class="trial-banner-left">
            <span class="material-icons">pending_actions</span>
            <span>Hồ sơ KYC của bạn đang <strong>chờ Admin xét duyệt</strong>. Các tính năng sẽ mở khóa sau khi được duyệt.</span>
          </div>
          <router-link to="/owner/settings?tab=kyc" class="trial-cta pending-cta">
            <span class="material-icons">visibility</span> Xem hồ sơ
          </router-link>
        </div>
      </transition>

      <!-- Banner 3: Bị từ chối KYC (REJECTED) -->
      <transition name="banner-slide">
        <div v-if="isKycRejected" class="trial-banner rejected-banner">
          <div class="trial-banner-left">
            <span class="material-icons">cancel</span>
            <span>Hồ sơ KYC bị <strong>từ chối</strong>. Vui lòng cập nhật lại thông tin và nộp lại.</span>
          </div>
          <router-link to="/owner/settings?tab=kyc" class="trial-cta rejected-cta">
            <span class="material-icons">edit</span> Nộp lại hồ sơ
          </router-link>
        </div>
      </transition>

      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <!-- Cung cấp isLocked cho tất cả các View con qua provide/inject -->
            <component :is="Component" :is-locked="isLocked" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { provide } from 'vue';
import OwnerSidebar from '../components/layout/OwnerSidebar.vue';
import OwnerHeader from '../components/layout/OwnerHeader.vue';
import { useOwnerTrial } from '../composables/useOwnerTrial.js';

export default {
  name: 'OwnerLayout',
  components: {
    OwnerSidebar,
    OwnerHeader
  },
  setup() {
    const { isLocked, isVerified, isKycApproved, isPendingReview, isKycRejected, isTrialExpired, timeLeftFormatted, trialPercent, startTrial, refreshStatus } = useOwnerTrial();

    // Đồng bộ ngay lập tức
    refreshStatus();

    // Cung cấp isLocked cho mọi component con (Vue provide/inject)
    provide('isLocked', isLocked);

    return { isLocked, isVerified, isKycApproved, isPendingReview, isKycRejected, isTrialExpired, timeLeftFormatted, trialPercent, startTrial, refreshStatus };
  },
  data() {
    return {
      isSidebarCollapsed: false,
    }
  },
  mounted() {
    // Khởi động timer ngay khi vào Dashboard
    this.startTrial();
    // Đồng bộ trạng thái mới nhất từ backend
    this.refreshStatus();
  }
}
</script>

<style scoped>
.owner-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Barlow', sans-serif;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 280px;
  min-width: 0;
}

.main-wrapper.sidebar-collapsed {
  margin-left: 80px;
}

/* Trial Banner */
.trial-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: white;
  padding: 12px 28px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  position: sticky;
  top: 80px;
  z-index: 100;
}

.trial-banner-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.trial-banner-left .material-icons {
  font-size: 18px;
  color: #fbbf24;
}

.trial-banner-left strong { color: #fbbf24; }

.trial-progress {
  width: 120px;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 100px;
  overflow: hidden;
}

.trial-bar {
  height: 100%;
  background: #16a34a;
  border-radius: 100px;
  transition: width 1s linear;
}

.trial-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #16a34a;
  color: white;
  text-decoration: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}

.trial-cta:hover { background: #15803d; }
.trial-cta .material-icons { font-size: 16px; }

/* Banner trạng thái PENDING (Chờ duyệt) */
.pending-banner {
  background: linear-gradient(135deg, #78350f, #92400e);
}
.pending-banner .material-icons { color: #fcd34d !important; }
.pending-cta { background: #d97706 !important; }
.pending-cta:hover { background: #b45309 !important; }

/* Banner trạng thái REJECTED (Bị từ chối) */
.rejected-banner {
  background: linear-gradient(135deg, #7f1d1d, #991b1b);
}
.rejected-banner .material-icons { color: #fca5a5 !important; }
.rejected-cta { background: #dc2626 !important; }
.rejected-cta:hover { background: #b91c1c !important; }

/* Banner animation */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.3s ease;
}
.banner-slide-enter-from,
.banner-slide-leave-to {
  opacity: 0;
  transform: translateY(-40px);
}

.content-area {
  padding: 30px;
  flex: 1;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1024px) {
  .main-wrapper { margin-left: 0 !important; }
  .trial-banner { flex-wrap: wrap; }
}
</style>
