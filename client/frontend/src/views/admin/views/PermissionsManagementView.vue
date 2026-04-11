<template>
  <div class="page">
    <div class="page-header">
      <div class="header-left">
        <div class="page-title">
          <Key :size="24" class="title-icon" />
          Phân quyền hệ thống
        </div>
        <div class="page-subtitle">Thiết lập quyền hạn truy cập cho từng vai trò người dùng trong hệ thống</div>
      </div>
      
      <div class="header-actions">
        <button class="btn-save" :disabled="!isDirty" @click="handleSaveChanges">
           <Save :size="16" /> Lưu thay đổi
        </button>
      </div>
    </div>

    <div class="permissions-layout mt-6">
      <!-- Role Sidebar -->
      <div class="role-sidebar">
        <div 
          v-for="role in roles" 
          :key="role.id" 
          class="role-item"
          :class="{ active: selectedRole === role.id }"
          @click="selectedRole = role.id"
        >
          <div class="role-icon" :class="role.id.toLowerCase()">
            <Shield :size="16" />
          </div>
          <div class="role-info">
            <div class="role-name">{{ role.name }}</div>
            <div class="role-count">{{ role.desc }}</div>
          </div>
        </div>
      </div>

      <!-- Permissions Matrix -->
      <div class="permissions-content custom-scrollbar">
        <div class="content-header">
           <h3>Quyền hạn cho {{ currentRoleName }}</h3>
           <p>Quản trị viên có tối quyền kiểm soát toàn bộ các phân hệ dưới đây</p>
        </div>

        <div v-for="cat in permissionCategories" :key="cat.name" class="permission-category">
           <div class="category-header">
              <component :is="cat.icon" :size="16" class="cat-icon" />
              {{ cat.name }}
           </div>
           
           <div class="permission-list">
              <div v-for="p in cat.permissions" :key="p.id" class="permission-row">
                 <div class="p-info">
                    <div class="p-title">{{ p.title }}</div>
                    <div class="p-desc">{{ p.desc }}</div>
                 </div>
                 <div class="p-action">
                    <label class="switch">
                       <input type="checkbox" v-model="rolePermissions[selectedRole][p.id]" @change="isDirty = true" />
                       <span class="slider"></span>
                    </label>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { 
  Key, Save, Shield, Users, Home, CircleDollarSign, 
  FileText, Settings, ShieldCheck, Lock
} from 'lucide-vue-next';

export default {
  name: 'PermissionsManagementView',
  components: { Key, Save, Shield, Users, Home, CircleDollarSign, FileText, Settings, ShieldCheck, Lock },
  setup() {
    const isDirty = ref(false);
    const selectedRole = ref('ADMIN');

    const roles = [
      { id: 'ADMIN', name: 'Super Admin', desc: 'Quyền quản trị tối cao' },
      { id: 'MODERATOR', name: 'Moderator', desc: 'Điều hành viên nội dung' },
      { id: 'OWNER', name: 'Owner', desc: 'Chủ sở hữu cơ sở' },
      { id: 'USER', name: 'Customer', desc: 'Khách hàng sử dụng dịch vụ' }
    ];

    const permissionCategories = [
      {
        name: 'Quản lý Người dùng',
        icon: 'Users',
        permissions: [
          { id: 'view_users', title: 'Xem danh sách người dùng', desc: 'Cho phép truy cập xem danh sách tài khoản' },
          { id: 'edit_users', title: 'Chỉnh sửa tài khoản', desc: 'Thay đổi thông tin, vai trò tài khoản' },
          { id: 'lock_users', title: 'Khóa/Mở khóa tài khoản', desc: 'Đình chỉ hoặc khôi phục quyền truy cập' }
        ]
      },
      {
        name: 'Kiểm duyệt Cơ sở',
        icon: 'Home',
        permissions: [
          { id: 'approve_clubs', title: 'Phê duyệt Câu lạc bộ', desc: 'Xét duyệt cơ sở mới đăng ký tham gia' },
          { id: 'verify_kyc', title: 'Xác minh KYC', desc: 'Kiểm tra và duyệt hồ sơ định danh chủ sân' },
          { id: 'manage_courts', title: 'Quản lý sân bãi', desc: 'Thay đổi trạng thái hoạt động các sân đơn lẻ' }
        ]
      },
      {
        name: 'Tài chính & Thống kê',
        icon: 'CircleDollarSign',
        permissions: [
          { id: 'view_finance', title: 'Xem doanh thu', desc: 'Truy cập các báo cáo tài chính hệ thống' },
          { id: 'export_reports', title: 'Xuất dữ liệu', desc: 'Tải các tệp Excel báo cáo về máy' }
        ]
      },
      {
        name: 'Cài đặt Hệ thống',
        icon: 'Settings',
        permissions: [
          { id: 'manage_settings', title: 'Cấu hình hệ thống', desc: 'Thay đổi các tham số kỹ thuật toàn cục' },
          { id: 'manage_perms', title: 'Quản lý phân quyền', desc: 'Thay đổi quyền hạn các vai trò khác' }
        ]
      }
    ];

    // Initial State Mockup
    const rolePermissions = ref({
      ADMIN: { view_users: true, edit_users: true, lock_users: true, approve_clubs: true, verify_kyc: true, manage_courts: true, view_finance: true, export_reports: true, manage_settings: true, manage_perms: true },
      MODERATOR: { view_users: true, edit_users: false, lock_users: true, approve_clubs: true, verify_kyc: false, manage_courts: true, view_finance: false, export_reports: false, manage_settings: false, manage_perms: false },
      OWNER: { view_users: false, edit_users: false, lock_users: false, approve_clubs: false, verify_kyc: false, manage_courts: true, view_finance: true, export_reports: false, manage_settings: false, manage_perms: false },
      USER: { view_users: false, edit_users: false, lock_users: false, approve_clubs: false, verify_kyc: false, manage_courts: false, view_finance: false, export_reports: false, manage_settings: false, manage_perms: false }
    });

    const currentRoleName = computed(() => {
      return roles.find(r => r.id === selectedRole.value)?.name;
    });

    const handleSaveChanges = () => {
      alert("Đã lưu các thiết lập phân quyền mới cho hệ thống.");
      isDirty.value = false;
    };

    return { 
      isDirty, selectedRole, roles, permissionCategories, 
      rolePermissions, currentRoleName, handleSaveChanges 
    };
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
.title-icon { color: var(--accent); }

.btn-save { display: flex; align-items: center; gap: 10px; background: var(--accent); color: white; border: none; border-radius: 8px; padding: 0 16px; height: 38px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3); }
.btn-save:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-save:disabled { background: var(--border); box-shadow: none; cursor: not-allowed; opacity: 0.6; }

.permissions-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; height: calc(100vh - 180px); }

.role-sidebar { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 12px; display: flex; flex-direction: column; gap: 4px; }
.role-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.role-item:hover { background: var(--bg-hover); }
.role-item.active { background: var(--bg-active); border: 1px solid rgba(var(--accent-rgb), 0.2); }

.role-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); color: var(--text-muted); }
.role-icon.admin { color: #f59e0b; background: rgba(245,158,11,0.1); }
.role-icon.moderator { color: #3b82f6; background: rgba(59,130,246,0.1); }
.role-icon.owner { color: #8b5cf6; background: rgba(139,92,246,0.1); }

.role-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
.role-count { font-size: 11px; color: var(--text-muted); }

.permissions-content { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow-y: auto; }
.content-header { padding: 24px; border-bottom: 1px solid var(--border); }
.content-header h3 { font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
.content-header p { font-size: 12px; color: var(--text-muted); margin: 0; }

.permission-category { padding: 24px; border-bottom: 1px solid var(--border); }
.category-header { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
.cat-icon { opacity: 0.8; }

.permission-list { display: flex; flex-direction: column; gap: 16px; }
.permission-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-tertiary); border-radius: 12px; border: 1px solid var(--border); transition: all 0.2s; }
.permission-row:hover { border-color: rgba(var(--accent-rgb), 0.3); background: rgba(var(--accent-rgb), 0.02); }

.p-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.p-desc { font-size: 11px; color: var(--text-muted); }

/* Switch Toggle */
.switch { position: relative; display: inline-block; width: 40px; height: 20px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .3s; border-radius: 20px; }
.slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
input:checked + .slider { background-color: var(--accent); }
input:checked + .slider:before { transform: translateX(20px); }

.mt-6 { margin-top: 24px; }
</style>
