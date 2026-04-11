<template>
  <div class="page">
    <div class="page-header">
      <div class="header-left">
        <div class="page-title">
          <FilePieChart :size="24" class="title-icon" />
          Báo cáo quản trị
        </div>
        <div class="page-subtitle">Xuất và quản lý các báo cáo định kỳ về hoạt động của hệ thống</div>
      </div>
      
      <div class="header-actions">
        <button class="btn-create" @click="handleCreateReport"><Plus :size="16" /> Tạo báo cáo mới</button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="reports-container mt-6">
      <div class="table-card">
        <div class="table-toolbar">
           <div class="tabs">
              <button 
                v-for="t in tabs" 
                :key="t.id" 
                class="tab-btn" 
                :class="{active: activeTab === t.id}"
                @click="activeTab = t.id"
              >
                {{ t.label }}
              </button>
           </div>
           
           <div class="search-input ml-auto">
              <Search :size="14" />
              <input type="text" placeholder="Tìm kiếm báo cáo..." />
           </div>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Tên báo cáo</th>
                <th>Loại</th>
                <th>Ngày tạo</th>
                <th>Kỳ báo cáo</th>
                <th>Trạng thái</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredReports" :key="r.id">
                <td>
                  <div class="report-name-cell">
                    <div class="report-icon" :class="r.type.toLowerCase()">
                       <component :is="r.icon" :size="14" />
                    </div>
                    <div class="report-info">
                       <div class="r-name">{{ r.name }}</div>
                       <div class="r-size">{{ r.size }} • {{ r.format }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="type-tag">{{ r.typeLabel }}</span></td>
                <td>{{ r.date }}</td>
                <td>{{ r.period }}</td>
                <td>
                  <div class="status-badge" :class="r.status">
                    <div class="dot"></div>
                    {{ r.statusLabel }}
                  </div>
                </td>
                <td>
                  <div class="row-actions justify-end">
                    <button class="row-btn" title="Xem chi tiết"><Eye :size="14" /></button>
                    <button class="row-btn success-hover" title="Tải xuống"><Download :size="14" /></button>
                    <button class="row-btn danger-hover" title="Xóa"><Trash2 :size="14" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Quick Export Section -->
    <div class="quick-export mt-8">
       <div class="section-title">Xuất báo cáo nhanh</div>
       <div class="export-grid">
          <div v-for="ex in quickExports" :key="ex.id" class="export-card">
             <div class="ex-icon"><component :is="ex.icon" :size="20" /></div>
             <div class="ex-info">
                <div class="ex-name">{{ ex.name }}</div>
                <div class="ex-desc">{{ ex.desc }}</div>
             </div>
             <button class="ex-btn"><Download :size="14" /> EXCEL</button>
          </div>
       </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { 
  FilePieChart, Plus, Search, Eye, Download, Trash2, 
  FileText, CircleDollarSign, Users, ShieldAlert,
  CalendarCheck
} from 'lucide-vue-next';

export default {
  name: 'ReportsManagementView',
  components: { 
    FilePieChart, Plus, Search, Eye, Download, Trash2, 
    FileText, CircleDollarSign, Users, ShieldAlert, CalendarCheck
  },
  setup() {
    const activeTab = ref('all');
    const tabs = [
      { id: 'all', label: 'Tất cả' },
      { id: 'FINANCE', label: 'Tài chính' },
      { id: 'USER', label: 'Người dùng' },
      { id: 'SYSTEM', label: 'Hệ thống' }
    ];

    const reports = ref([
      { id: 1, name: 'Báo cáo doanh thu Tháng 3/2026', type: 'FINANCE', typeLabel: 'Tài chính', icon: 'CircleDollarSign', date: '30/03/2026', period: 'Tháng 3/2026', size: '256 KB', format: 'Excel', status: 'ready', statusLabel: 'Sẵn sàng' },
      { id: 2, name: 'Thống kê người dùng mới Quý 1', type: 'USER', typeLabel: 'Người dùng', icon: 'Users', date: '28/03/2026', period: 'Quý 1/2026', size: '1.2 MB', format: 'PDF', status: 'ready', statusLabel: 'Sẵn sàng' },
      { id: 3, name: 'Báo cáo vi phạm & Giải quyết khiếu nại', type: 'SYSTEM', typeLabel: 'Hệ thống', icon: 'ShieldAlert', date: '25/03/2026', period: 'Tuần qua', size: '124 KB', format: 'Excel', status: 'ready', statusLabel: 'Sẵn sàng' },
      { id: 4, name: 'Phân tích tỉ lệ lấp đầy sân bóng đá', type: 'FINANCE', typeLabel: 'Vận hành', icon: 'CalendarCheck', date: '20/03/2026', period: 'Tháng 3/2026', size: '45 KB', format: 'CSV', status: 'processing', statusLabel: 'Đang xử lý' }
    ]);

    const quickExports = [
      { id: 'rev', name: 'Doanh thu hệ thống', desc: 'Dữ liệu toàn bộ giao dịch CONFIRMED', icon: 'CircleDollarSign' },
      { id: 'usr', name: 'Danh sách Người dùng', desc: 'Thông tin cơ bản & hoạt động cuối', icon: 'Users' },
      { id: 'club', name: 'Câu lạc bộ & Đối tác', desc: 'Danh sách cơ sở & Trạng thái KYC', icon: 'FileText' }
    ];

    const filteredReports = computed(() => {
      if (activeTab.value === 'all') return reports.value;
      return reports.value.filter(r => r.type === activeTab.value);
    });

    const handleCreateReport = () => {
      alert("Chức năng tạo báo cáo tùy chỉnh đang được phát triển.");
    };

    return { 
      activeTab, tabs, filteredReports, 
      quickExports, handleCreateReport 
    };
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
.title-icon { color: var(--accent); }

.btn-create { display: flex; align-items: center; gap: 10px; background: var(--accent); color: white; border: none; border-radius: 8px; padding: 0 16px; height: 38px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3); }
.btn-create:hover { filter: brightness(1.1); transform: translateY(-1px); }

/* Tabs */
.tabs { display: flex; gap: 4px; background: var(--bg-tertiary); padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
.tab-btn { 
  padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 700; 
  color: var(--text-secondary); border: none; background: transparent; 
  cursor: pointer; transition: all 0.2s;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { background: var(--bg-secondary); color: var(--accent); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

.table-toolbar { padding: 14px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--border); }
.search-input { display: flex; align-items: center; gap: 10px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; padding: 0 14px; height: 38px; width: 280px; }
.search-input input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 13px; width: 100%; }

/* Table Cells */
.report-name-cell { display: flex; align-items: center; gap: 12px; }
.report-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.report-icon.finance { background: rgba(59,130,246,0.1); color: #3b82f6; }
.report-icon.user { background: rgba(168,85,247,0.1); color: #a855f7; }
.report-icon.system { background: rgba(249,115,22,0.1); color: var(--orange); }

.r-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.r-size { font-size: 11px; color: var(--text-muted); }

.type-tag { font-size: 11px; font-weight: 800; color: var(--text-secondary); background: var(--bg-tertiary); padding: 4px 10px; border-radius: 6px; }

/* Status */
.status-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.status-badge.ready { color: var(--green); }
.status-badge.ready .dot { background: var(--green); box-shadow: 0 0 8px var(--green); }
.status-badge.processing { color: var(--orange); }
.status-badge.processing .dot { background: var(--orange); animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }

/* Quick Export */
.section-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
.export-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.export-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; display: flex; align-items: center; gap: 16px; }
.ex-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--accent); }
.ex-info { flex: 1; }
.ex-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.ex-desc { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.ex-btn { 
  display: flex; align-items: center; gap: 6px; padding: 8px 12px; 
  background: transparent; border: 1px solid var(--border); border-radius: 8px; 
  font-size: 11px; font-weight: 800; color: var(--green); cursor: pointer; 
  transition: all 0.2s;
}
.ex-btn:hover { background: rgba(34, 197, 94, 0.1); border-color: var(--green); }

/* Helpers */
.text-right { text-align: right; }
.justify-end { justify-content: flex-end; }
.ml-auto { margin-left: auto; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }

/* Row Actions */
.row-actions { display: flex; gap: 6px; }
.row-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.row-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--bg-hover); }
.row-btn.success-hover:hover { background: var(--green); color: white; border-color: var(--green); }
.row-btn.danger-hover:hover { background: var(--red); color: white; border-color: var(--red); }
</style>
