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

import { ref, computed, onUnmounted } from 'vue';

const TRIAL_DURATION_MS = 5 * 60 * 1000; // 5 phút
const TRIAL_START_KEY = 'owner_trial_start';

// State singleton dùng chung toàn app
const timeLeft = ref(TRIAL_DURATION_MS);
const isTrialExpired = ref(false);
let timer = null;

export function useOwnerTrial() {
  // Lấy user từ localStorage (reactive mỗi lần computed chạy)
  const user = computed(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // kycStatus từ backend: null | 'PENDING' | 'APPROVED' | 'REJECTED'
  const kycStatus = computed(() => user.value?.kycStatus ?? null);

  // Admin đã duyệt → mở khóa hoàn toàn
  const isKycApproved = computed(() => kycStatus.value === 'APPROVED');

  // Đã nộp hồ sơ nhưng đang chờ duyệt
  const isPendingReview = computed(() => kycStatus.value === 'PENDING');

  // Bị từ chối, cần nộp lại
  const isKycRejected = computed(() => kycStatus.value === 'REJECTED');

  // isVerified (legacy): dùng cho UI badge "đã nộp hồ sơ"
  const isVerified = computed(() => user.value?.isVerified === true);

  // 🔒 Chỉ bị khóa khi trial hết VÀ Admin chưa approve
  const isLocked = computed(() => !isKycApproved.value && isTrialExpired.value);

  // Phần trăm thời gian còn lại
  const trialPercent = computed(() => {
    if (isKycApproved.value) return 100;
    return Math.max(0, Math.round((timeLeft.value / TRIAL_DURATION_MS) * 100));
  });

  // Format "4:59"
  const timeLeftFormatted = computed(() => {
    if (isKycApproved.value) return null;
    const min = Math.floor(timeLeft.value / 60000);
    const sec = Math.floor((timeLeft.value % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  });

  function startTrial() {
    // Đã được Admin approve thì không cần timer
    if (isKycApproved.value) return;

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

  function resetTrial() {
    localStorage.removeItem(TRIAL_START_KEY);
    timeLeft.value = TRIAL_DURATION_MS;
    isTrialExpired.value = false;
    if (timer) { clearInterval(timer); timer = null; }
  }

  onUnmounted(() => {
    // Không dừng timer khi unmount (singleton), chỉ cleanup nếu cần
  });

  return {
    isLocked,
    isVerified,      // đã nộp hồ sơ (isVerified = true khi kycStatus PENDING+)
    isKycApproved,   // Admin đã duyệt → dashboard mở khóa
    isPendingReview, // đang chờ Admin duyệt
    isKycRejected,   // bị từ chối
    kycStatus,       // raw: null | 'PENDING' | 'APPROVED' | 'REJECTED'
    isTrialExpired,
    timeLeft,
    timeLeftFormatted,
    trialPercent,
    startTrial,
    resetTrial,
  };
}
