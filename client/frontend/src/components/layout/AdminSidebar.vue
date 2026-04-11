<template>
  <aside class="sidebar custom-scrollbar">
    <div class="sidebar-logo">
      <div class="logo-icon"><div class="icon-inner"><Activity :size="18" stroke-width="2.5" /></div></div>
      <div>
        <div class="logo-text">SportField</div>
        <div class="logo-sub">Admin Dashboard</div>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Tổng quan</div>
      <router-link to="/admin" class="nav-item" active-class="active">
        <span class="nav-icon"><LayoutDashboard :size="16" /></span> Dashboard
      </router-link>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Câu lạc bộ & Sân</div>
      <router-link to="/admin/courts" class="nav-item" active-class="active">
        <span class="nav-icon"><Home :size="16" /></span> Danh sách cơ sở
      </router-link>
      <router-link to="/admin/courts/pending" class="nav-item" active-class="active">
        <span class="nav-icon"><Clock :size="16" /></span> Duyệt câu lạc bộ 
        <span v-if="stats.pendingClubs > 0" class="nav-badge orange">{{ stats.pendingClubs }}</span>
      </router-link>
      <router-link to="/admin/courts/locked" class="nav-item" active-class="active">
        <span class="nav-icon"><Lock :size="16" /></span> Cơ sở bị khóa
      </router-link>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Quản lý tài khoản</div>
      <router-link to="/admin/users" class="nav-item" active-class="active">
        <span class="nav-icon"><Users :size="16" /></span> Người dùng
      </router-link>
      <router-link to="/admin/owners" class="nav-item" active-class="active">
        <span class="nav-icon"><Building2 :size="16" /></span> Hồ sơ chủ Câu lạc bộ
      </router-link>
      <router-link to="/admin/owners/kyc" class="nav-item" active-class="active">
        <span class="nav-icon"><ShieldCheck :size="16" /></span> Duyệt định danh (KYC)
        <span v-if="stats.pendingKyc > 0" class="nav-badge orange">{{ stats.pendingKyc }}</span>
      </router-link>
      <router-link to="/admin/violations" class="nav-item" active-class="active">
        <span class="nav-icon"><ShieldAlert :size="16" /></span> Vi phạm 
        <span v-if="stats.violations > 0" class="nav-badge">{{ stats.violations }}</span>
      </router-link>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Quản lý nội dung</div>
      <router-link to="/admin/posts" class="nav-item" active-class="active">
        <span class="nav-icon"><FileText :size="16" /></span> Bài đăng
      </router-link>
      <router-link to="/admin/news" class="nav-item" active-class="active">
        <span class="nav-icon"><Newspaper :size="16" /></span> Bảng tin
      </router-link>
      <router-link to="/admin/community" class="nav-item" active-class="active">
        <span class="nav-icon"><MessageSquare :size="16" /></span> Cộng đồng
      </router-link>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Thống kê & Báo cáo</div>
      <router-link to="/admin/stats" class="nav-item" active-class="active">
        <span class="nav-icon"><BarChart3 :size="16" /></span> Thống kê hệ thống
      </router-link>
      <router-link to="/admin/reports" class="nav-item" active-class="active">
        <span class="nav-icon"><FilePieChart :size="16" /></span> Báo cáo
      </router-link>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Hệ thống</div>
      <router-link to="/admin/permissions" class="nav-item" active-class="active">
        <span class="nav-icon"><Key :size="16" /></span> Phân quyền
      </router-link>
      <router-link to="/admin/settings" class="nav-item" active-class="active">
        <span class="nav-icon"><Settings :size="16" /></span> Cài đặt
      </router-link>
    </div>

    <div class="sidebar-bottom">
      <div class="user-card" @click="handleLogout">
        <div class="user-avatar"><User :size="16" stroke-width="2.5" /></div>
        <div class="user-info">
          <div class="user-name">Super Admin</div>
          <div class="user-role">Quản trị viên hệ thống</div>
        </div>
        <LogOut :size="14" class="logout-icon" />
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Activity, LayoutDashboard, Home, Clock, Lock, 
  Users, Building2, ShieldAlert, FileText, Newspaper, 
  MessageSquare, BarChart3, FilePieChart, Key, Settings,
  User, LogOut, ShieldCheck
} from 'lucide-vue-next';
import { adminService } from '@/services/admin.service';

export default {
  name: 'AdminSidebar',
  components: {
    Activity, LayoutDashboard, Home, Clock, Lock, 
    Users, Building2, ShieldAlert, FileText, Newspaper, 
    MessageSquare, BarChart3, FilePieChart, Key, Settings,
    User, LogOut, ShieldCheck
  },
  setup() {
    const router = useRouter();
    const stats = ref({
      pendingClubs: 0,
      pendingKyc: 0,
      violations: 0
    });

    const fetchStats = async () => {
      try {
        const response = await adminService.getSummary();
        const data = response.data.data;
        stats.value = {
          pendingClubs: data.pendingClubs || 0,
          pendingKyc: data.pendingKyc || 0,
          violations: data.violations || 0
        };
      } catch (error) {
        console.error("Lỗi khi tải thông báo sidebar:", error);
      }
    };

    const handleLogout = () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
      }
    };

    onMounted(() => {
      fetchStats();
    });

    return {
      stats,
      handleLogout
    };
  }
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
  height: 100vh;
}

.sidebar-logo {
  padding: 18px 16px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
}

.logo-icon { 
  width: 32px; 
  height: 32px; 
  background: var(--accent); 
  border-radius: 8px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #fff;
}

.logo-text { 
  font-family: 'Barlow', sans-serif; 
  font-weight: 700; 
  font-size: 15px; 
  color: var(--text-primary);
}

.logo-sub { 
  font-size: 10px; 
  color: var(--text-muted); 
  font-weight: 400; 
}

.sidebar-section { padding: 16px 10px 8px; }
.sidebar-label { 
  font-size: 10px; 
  font-weight: 600; 
  text-transform: uppercase; 
  letter-spacing: 0.08em; 
  color: var(--text-muted); 
  padding: 0 8px; 
  margin-bottom: 4px; 
}

.nav-item {
  display: flex; 
  align-items: center; 
  gap: 9px; 
  padding: 7px 11px; 
  border-radius: 6px; 
  cursor: pointer;
  font-size: 13px; 
  color: var(--text-secondary); 
  transition: all 0.15s; 
  margin-bottom: 1px; 
  position: relative;
  text-decoration: none;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-item:hover .nav-icon { opacity: 1; }
.nav-item.active { background: var(--bg-active); color: var(--text-primary); }
.nav-item.active .nav-icon { opacity: 1; color: var(--accent); }
.nav-item.active::before { 
  content: ''; 
  position: absolute; 
  left: 0; 
  top: 50%; 
  transform: translateY(-50%); 
  width: 3px; 
  height: 60%; 
  background: var(--accent); 
  border-radius: 0 2px 2px 0; 
}

.nav-badge { 
  margin-left: auto; 
  font-size: 10px; 
  background: var(--red); 
  color: #fff; 
  padding: 1px 6px; 
  border-radius: 10px; 
  font-weight: 600; 
}
.nav-badge.orange { background: var(--orange); }

.sidebar-bottom { margin-top: auto; padding: 12px 10px; border-top: 1px solid var(--border); }

.user-card { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 8px; 
  border-radius: 8px; 
  cursor: pointer; 
}
.user-card:hover { background: var(--bg-hover); }

.user-avatar { 
  width: 32px; 
  height: 32px; 
  border-radius: 50%; 
  background: linear-gradient(135deg, var(--accent), var(--purple)); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #fff;
}

.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
.user-role { font-size: 11px; color: var(--text-muted); }

.logout-icon {
  color: var(--text-muted);
  opacity: 0.5;
  transition: all 0.2s;
}
.user-card:hover .logout-icon {
  color: var(--red);
  opacity: 1;
}
</style>