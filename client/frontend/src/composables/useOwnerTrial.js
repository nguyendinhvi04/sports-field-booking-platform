/**
 * useOwnerTrial composable
 * 
 * Quản lý trạng thái "dùng thử" 5 phút của chủ sân mới.
 * - Khi Owner đăng nhập (kycStatus !== 'APPROVED'), bắt đầu đếm giờ 5 phút.
 * - Sau 5 phút, isLocked = true → các tab dashboard bị khóa.
 * - Chỉ mở khóa hoàn toàn khi Admin đã duyệt: kycStatus === 'APPROVED'.
 *
 * Phân biệt:
 *   isVerified   = Owner đã NỘP hồ sơ (kycStatus: PENDING)
 *   isKycApproved = Admin đã DUYỆT hồ sơ (kycStatus: APPROVED) → mở khóa dashboard
 */

import { ref, computed } from 'vue';
import api from '../api/axios';

const TRIAL_DURATION_MS = 5 * 60 * 1000; // 5 phút
const TRIAL_START_KEY = 'owner_trial_start';

// State singleton dùng chung toàn app
const timeLeft = ref(TRIAL_DURATION_MS);
const isTrialExpired = ref(false);
const user = ref(JSON.parse(localStorage.getItem('user')) || null);
let timer = null;

export function useOwnerTrial() {

  // Sync user from localStorage whenever called (simple reactivity)
  function syncUser() {
    user.value = JSON.parse(localStorage.getItem('user')) || null;
  }

  // kycStatus: null | 'PENDING' | 'APPROVED' | 'REJECTED'
  const kycStatus = computed(() => user.value?.kycStatus ?? null);

  // Status flags
  const isKycApproved = computed(() => kycStatus.value === 'APPROVED');
  const isPendingReview = computed(() => kycStatus.value === 'PENDING');
  const isKycRejected = computed(() => kycStatus.value === 'REJECTED');
  
  // 🔒 Chỉ bị khóa khi trial hết VÀ Admin chưa approve
  const isLocked = computed(() => {
    if (isKycApproved.value) return false;
    return isTrialExpired.value;
  });

  // Percent & Formatted Time
  const trialPercent = computed(() => {
    if (isKycApproved.value) return 100;
    return Math.max(0, Math.round((timeLeft.value / TRIAL_DURATION_MS) * 100));
  });

  const timeLeftFormatted = computed(() => {
    if (isKycApproved.value) return null;
    const min = Math.floor(timeLeft.value / 60000);
    const sec = Math.floor((timeLeft.value % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  });

  // Action: Cập nhật kycStatus từ backend (gọi khi mount layout)
  async function refreshStatus() {
    try {
      const response = await api.get('/auth/profile');
      const data = response.data;
      
      if (data.success && data.data) {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { 
          ...currentUser, 
          kycStatus: data.data.ownerProfile?.kycStatus ?? null,
          isVerified: data.data.isVerified
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        syncUser();
        
        // Nếu đã được duyệt, dừng trial luôn
        if (updatedUser.kycStatus === 'APPROVED') {
          stopTimer();
        }
      }
    } catch (err) {
      console.error("Failed to refresh owner status:", err);
    }
  }

  function startTrial() {
    if (isKycApproved.value) {
      isTrialExpired.value = false;
      timeLeft.value = TRIAL_DURATION_MS;
      return;
    }

    if (!localStorage.getItem(TRIAL_START_KEY)) {
      localStorage.setItem(TRIAL_START_KEY, Date.now().toString());
    }

    const startTime = parseInt(localStorage.getItem(TRIAL_START_KEY));
    const elapsed = Date.now() - startTime;

    if (elapsed >= TRIAL_DURATION_MS) {
      isTrialExpired.value = true;
      timeLeft.value = 0;
      return;
    }

    timeLeft.value = TRIAL_DURATION_MS - elapsed;
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      const remaining = TRIAL_DURATION_MS - (Date.now() - startTime);
      if (remaining <= 0) {
        timeLeft.value = 0;
        isTrialExpired.value = true;
        clearInterval(timer);
        timer = null;
      } else {
        timeLeft.value = remaining;
      }
    }, 1000);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function resetTrial() {
    localStorage.removeItem(TRIAL_START_KEY);
    timeLeft.value = TRIAL_DURATION_MS;
    isTrialExpired.value = false;
    stopTimer();
  }

  const isVerified = computed(() => user.value?.isVerified === true);

  return {
    isLocked,
    isVerified,
    isKycApproved,
    isPendingReview,
    isKycRejected,
    kycStatus,
    isTrialExpired,
    timeLeftFormatted,
    trialPercent,
    startTrial,
    refreshStatus,
    resetTrial,
  };
}
