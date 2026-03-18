<template>
  <header class="header-wrapper">
    <div class="header-left">
      <button class="toggle-btn" @click="$emit('toggle-sidebar')">
        <span class="material-icons">menu_open</span>
      </button>
      <div class="header-title">
        <h2 class="breadcrumb-item primary">DASHBOARD</h2>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item current">Chào buổi sáng, Owner! 👋</span>
      </div>
    </div>
    
    <div class="header-right">
      <div class="header-notifications">
        <button class="notif-btn">
          <span class="material-icons notif-icon">notifications</span>
          <span class="notif-badge">3</span>
        </button>
      </div>
      <div class="user-profile">
        <div class="user-info">
          <p class="user-name">Phan Tuấn Anh</p>
          <p class="user-role">Sân bóng Thành Phát</p>
        </div>
        <img class="user-avatar" src="https://ui-avatars.com/api/?name=Owner&background=16a34a&color=fff" alt="User Avatar" />
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'OwnerHeader',
  emits: ['toggle-sidebar']
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
.header-wrapper {
  height: 80px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.toggle-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #e2e8f0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.breadcrumb-item {
  font-size: 14px;
}

.breadcrumb-item.primary {
  font-weight: 800;
  color: #1a1a2e;
  letter-spacing: 0.5px;
}

.breadcrumb-item.current {
  color: #64748b;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.notif-btn {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  font-size: 20px;
  color: #64748b;
}

.notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  border: 2px solid #fff;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border-radius: 50px;
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
}

.user-info {
  text-align: right;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

@media (max-width: 640px) {
  .user-info {
    display: none;
  }
  .breadcrumb-item.current {
    display: none;
  }
}
</style>
