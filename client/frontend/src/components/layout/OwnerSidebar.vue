<template>
  <aside class="sidebar-wrapper" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <svg fill="none" height="40" viewBox="0 0 24 24" width="40">
          <circle cx="12" cy="12" r="10" stroke="#16a34a" stroke-width="2.5"/>
          <path d="M8 12l3 3 5-5" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">Playfinder</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in menuItems" :key="item.name" class="nav-item">
          <router-link :to="item.path" class="nav-link" active-class="active">
            <span class="material-icons nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.badge && !isLocked" class="nav-badge">{{ item.badge }}</span>
            <!-- Icon khóa hiển thị khi tính năng bị khóa -->
            <span v-if="isLocked && item.lockable" class="lock-badge">
              <span class="material-icons">lock</span>
            </span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Sidebar Footer: Trạng thái hồ sơ -->
    <div class="sidebar-footer">
      <router-link to="/owner/settings" class="profile-status" :class="{ locked: isLocked, verified: !isLocked }">
        <span class="material-icons">{{ isLocked ? 'warning_amber' : 'verified_user' }}</span>
        <div class="status-text" v-if="!isCollapsed">
          <p class="status-title">{{ isLocked ? 'Hồ sơ chưa đầy đủ' : 'Đã xác minh' }}</p>
          <p class="status-sub">{{ isLocked ? 'Nhấn để cập nhật' : 'Tài khoản hoạt động' }}</p>
        </div>
      </router-link>
      <button class="logout-btn" @click="logout">
        <span class="material-icons nav-icon">logout</span>
        <span class="nav-label">Đăng xuất</span>
      </button>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'OwnerSidebar',
  props: {
    isCollapsed: Boolean,
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      menuItems: [
        { name: 'dashboard', label: 'Tổng quan',   path: '/owner',           icon: 'space_dashboard',          lockable: false },
        { name: 'clubs',     label: 'Câu lạc bộ',  path: '/owner/clubs',     icon: 'business',                 lockable: true },
        { name: 'courts',    label: 'Quản lý sân',  path: '/owner/courts',    icon: 'sports_soccer',            lockable: true },
        { name: 'bookings',  label: 'Đơn đặt sân',  path: '/owner/bookings',  icon: 'event_available',          lockable: true, badge: '5' },
        { name: 'finance',   label: 'Tài chính',    path: '/owner/finance',   icon: 'account_balance_wallet',   lockable: true },
        { name: 'customers', label: 'Khách hàng',   path: '/owner/customers', icon: 'groups',                   lockable: true },
        { name: 'vouchers',  label: 'Khuyến mãi',   path: '/owner/vouchers',  icon: 'local_offer',              lockable: true },
        { name: 'reviews',   label: 'Đánh giá',     path: '/owner/reviews',   icon: 'reviews',                  lockable: true },
        { name: 'settings',  label: 'Cài đặt',      path: '/owner/settings',  icon: 'settings',                 lockable: false },
      ]
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('owner_trial_start');
      this.$router.push('/auth/login');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');

.sidebar-wrapper {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 4px 0 10px rgba(0,0,0,0.02);
}

.sidebar-wrapper.collapsed { width: 80px; }

/* Header */
.sidebar-header {
  height: 80px;
  display: flex; align-items: center;
  padding: 0 24px;
}

.sidebar-logo {
  display: flex; align-items: center;
  gap: 12px; overflow: hidden;
}

.logo-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 24px; font-weight: 800; color: #1a1a2e;
  letter-spacing: 0.5px; white-space: nowrap; transition: opacity 0.3s;
}

.sidebar-wrapper.collapsed .logo-text { opacity: 0; visibility: hidden; }

/* Nav */
.sidebar-nav { flex: 1; padding: 20px 0; overflow-y: auto; }
.nav-list { list-style: none; padding: 0; margin: 0; }
.nav-item { padding: 4px 16px; }

.nav-link {
  display: flex; align-items: center;
  padding: 12px 14px; border-radius: 12px;
  color: #64748b; text-decoration: none;
  transition: all 0.2s; gap: 12px; position: relative;
}

.nav-link:hover { background-color: #f1f5f9; color: #16a34a; }
.nav-link.active { background-color: #f0fdf4; color: #16a34a; font-weight: 600; }
.nav-link.active::before {
  content: "";
  position: absolute; left: -16px; top: 50%;
  transform: translateY(-50%);
  width: 4px; height: 70%;
  background-color: #16a34a; border-radius: 0 4px 4px 0;
}

.nav-icon { font-size: 20px; display: flex; justify-content: center; align-items: center; width: 24px; flex-shrink: 0; }
.nav-label { font-size: 15px; white-space: nowrap; transition: opacity 0.3s; flex: 1; }

.sidebar-wrapper.collapsed .nav-label,
.sidebar-wrapper.collapsed .nav-badge,
.sidebar-wrapper.collapsed .lock-badge { opacity: 0; visibility: hidden; }

.nav-badge {
  background-color: #ef4444; color: white;
  font-size: 11px; padding: 2px 8px;
  border-radius: 20px; margin-left: auto;
}

/* Lock Badge */
.lock-badge {
  margin-left: auto;
  display: flex; align-items: center;
  color: #f59e0b;
}

.lock-badge .material-icons { font-size: 16px; }

/* Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex; flex-direction: column; gap: 8px;
}

/* Profile status card */
.profile-status {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  text-decoration: none; transition: all 0.2s; overflow: hidden;
}

.profile-status.locked {
  background: #fffbeb; color: #d97706; border: 1px solid #fde68a;
}

.profile-status.locked:hover { background: #fef3c7; }

.profile-status.verified {
  background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;
}

.profile-status .material-icons { font-size: 22px; flex-shrink: 0; }

.status-text { min-width: 0; }
.status-title { font-size: 13px; font-weight: 700; margin: 0; white-space: nowrap; }
.status-sub { font-size: 11px; opacity: 0.7; margin: 0; white-space: nowrap; }

.sidebar-wrapper.collapsed .status-text { opacity: 0; visibility: hidden; }

/* Logout */
.logout-btn {
  width: 100%;
  display: flex; align-items: center;
  padding: 12px 14px; border: none;
  background: none; border-radius: 12px;
  color: #94a3b8; cursor: pointer;
  gap: 12px; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
}

.logout-btn:hover { background-color: #fef2f2; color: #ef4444; }
.sidebar-wrapper.collapsed .logout-btn { padding-left: 14px; }

@media (max-width: 1024px) {
  .sidebar-wrapper { transform: translateX(-100%); }
  .sidebar-wrapper.active { transform: translateX(0); }
}
</style>
