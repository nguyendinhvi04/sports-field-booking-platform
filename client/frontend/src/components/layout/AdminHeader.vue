<template>
  <div class="topbar">
    <div class="breadcrumb">
      SportField / <span>{{ breadcrumb }}</span>
    </div>
    <div class="topbar-actions">
      <div class="search-bar">
        <Search :size="14" class="search-icon" />
        <input type="text" placeholder="Tìm kiếm..." />
      </div>
      <button class="topbar-btn">
        <Bell :size="16" />
      </button>
      <button class="topbar-btn">
        <User :size="16" />
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Search, Bell, User } from 'lucide-vue-next';

export default {
  name: 'AdminHeader',
  components: {
    Search, Bell, User
  },
  setup() {
    const route = useRoute();

    const breadcrumb = computed(() => {
      const pathMap = {
        '/admin': 'Dashboard',
        '/admin/courts': 'Quản lý sân / Tất cả sân',
        '/admin/courts/pending': 'Quản lý sân / Duyệt sân mới',
        '/admin/courts/locked': 'Sân bị khóa',
        '/admin/users': 'Quản lý tài khoản / Người dùng',
        '/admin/owners': 'Chủ sân',
        '/admin/violations': 'Vi phạm',
        '/admin/posts': 'Bài đăng',
        '/admin/news': 'Bảng tin',
        '/admin/community': 'Cộng đồng',
        '/admin/stats': 'Thống kê hệ thống',
        '/admin/reports': 'Báo cáo',
        '/admin/permissions': 'Phân quyền hệ thống',
        '/admin/settings': 'Cài đặt'
      };
      
      return pathMap[route.path] || route.name || 'Admin';
    });

    return {
      breadcrumb
    };
  }
}
</script>

<style scoped>
.topbar {
  height: 52px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  z-index: 100;
  position: sticky;
  top: 0;
}

@media (max-width: 768px) {
  .topbar {
    padding: 0 16px;
  }
  .search-bar {
    display: none;
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.breadcrumb span {
  color: var(--text-primary);
  font-weight: 500;
}

.topbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.topbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 12px;
  height: 32px;
  width: 220px;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.search-bar:focus-within {
  border-color: var(--accent);
  background: var(--bg-hover);
}

.search-bar input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 12px;
  width: 100%;
}

.search-icon {
  color: var(--text-muted);
  opacity: 0.7;
}
</style>