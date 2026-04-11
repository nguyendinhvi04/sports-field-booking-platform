<template>
  <div class="admin-body">
    <AdminSidebar />
    <main class="main">
      <AdminHeader />
      <div class="admin-content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import AdminHeader from '../components/layout/AdminHeader.vue';
import AdminSidebar from '../components/layout/AdminSidebar.vue';

export default {
    name: 'AdminLayout',
    components: {
        AdminHeader,
        AdminSidebar,
    },
}
</script>

<style>
@import '../assets/admin.css';

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 32px 28px 48px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

/* Base Utility Classes used across admin pages */
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Barlow', sans-serif; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px; color: var(--text-primary); }
.page-title .count { font-size: 13px; font-weight: 500; background: var(--bg-tertiary); border: 1px solid var(--border); padding: 2px 10px; border-radius: 20px; color: var(--text-secondary); }
.page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 500; }
.badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.badge.green { background: var(--green-soft); color: var(--green); }
.badge.red { background: var(--red-soft); color: var(--red); }
.badge.orange { background: var(--orange-soft); color: var(--orange); }
.badge.yellow { background: var(--yellow-soft); color: var(--yellow); }
.badge.blue { background: var(--accent-soft); color: var(--accent); }
.badge.purple { background: var(--purple-soft); color: var(--purple); }

.table-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead th { padding: 10px 16px; text-align: left; font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); border-bottom: 1px solid var(--border); white-space: nowrap; }
tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; cursor: pointer; }
tbody tr:hover { background: var(--bg-hover); }
td { padding: 11px 16px; font-size: 13px; vertical-align: middle; white-space: nowrap; color: var(--text-primary); }

.action-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; font-size: 12.5px; cursor: pointer; font-weight: 500; border: none; }
.action-btn.primary { background: var(--accent); color: #fff; }
.action-btn.ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
</style>