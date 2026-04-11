<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">
        <TicketPercent :size="24" class="title-icon" />
        Chiến dịch Voucher hệ thống
        <span class="count">{{ activeVouchers }} mã đang chạy</span>
      </div>
      <div class="page-subtitle">Tạo và quản lý các mã giảm giá áp dụng cho toàn bộ nền tảng hoặc từng cụm sân cụ thể</div>
    </div>

    <!-- Toolbar -->
    <div class="table-card">
      <div class="table-toolbar">
         <div class="filters">
            <button class="filter-btn active">Toàn hệ thống</button>
            <button class="filter-btn">Theo CLB</button>
         </div>
         <button class="action-btn primary ml-auto" @click="openCreateModal">
            <Plus :size="16" /> Tạo Voucher mới
         </button>
      </div>

      <div class="voucher-grid">
         <div v-for="v in vouchers" :key="v.id" class="v-card" :class="{inactive: !v.isActive}">
            <div class="v-card-inner">
               <div class="v-left">
                  <div class="v-icon"><Ticket :size="20" /></div>
               </div>
               <div class="v-right">
                  <div class="v-header">
                     <span class="v-tag">{{ v.type === 'PERCENTAGE' ? 'Giảm %' : 'Giảm số tiền' }}</span>
                     <span class="v-status" :class="v.isActive ? 'active' : 'inactive'">{{ v.isActive ? 'Đang chạy' : 'Đã dừng' }}</span>
                  </div>
                  <div class="v-title">{{ v.title }}</div>
                  <div class="v-code">CODE: <span>{{ v.code }}</span></div>
                  <div class="v-details">
                     <div class="v-detail-item">
                        <Users :size="12" /> Lượt dùng: {{ v.usedCount }}/{{ v.usageLimit || '∞' }}
                     </div>
                     <div class="v-detail-item">
                        <Calendar :size="12" /> Hết hạn: {{ v.endDate }}
                     </div>
                  </div>
               </div>
            </div>
            <div class="v-actions">
               <button class="v-btn"><Pencil :size="14" /></button>
               <button class="v-btn" @click="toggleStatus(v)"><Power :size="14" /></button>
               <button class="v-btn danger"><Trash2 :size="14" /></button>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { 
  TicketPercent, Plus, Ticket, Users, Calendar, 
  Pencil, Power, Trash2 
} from 'lucide-vue-next';

export default {
  name: 'MarketingVoucherView',
  components: {
    TicketPercent, Plus, Ticket, Users, Calendar, Pencil, Power, Trash2
  },
  setup() {
    const vouchers = ref([
      { id: '1', code: 'HELLO2026', title: 'Chào mừng Xuân 2026', type: 'PERCENTAGE', value: 10, usageLimit: 500, usedCount: 142, endDate: '30/04/2026', isActive: true },
      { id: '2', code: 'SPORTFAN', title: 'Giảm 50k cho đơn từ 300k', type: 'FIXED_AMOUNT', value: 50000, usageLimit: 100, usedCount: 88, endDate: '15/04/2026', isActive: true },
      { id: '3', code: 'SUMMER_VIBE', title: 'Khuyến mãi Hè rực rỡ', type: 'PERCENTAGE', value: 15, usageLimit: 1000, usedCount: 0, endDate: '30/06/2026', isActive: false },
    ]);

    const activeVouchers = computed(() => vouchers.value.filter(v => v.isActive).length);

    const toggleStatus = (v) => {
      v.isActive = !v.isActive;
    };

    return {
      vouchers, activeVouchers, toggleStatus
    };
  }
}
</script>

<style scoped>
.title-icon { color: var(--accent); }

.table-toolbar { padding: 16px; border-bottom: none; }
.filters { display: flex; gap: 8px; }
.filter-btn { padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border); cursor: pointer; }
.filter-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

.voucher-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; padding: 20px; }
.v-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; position: relative; overflow: hidden; transition: all 0.2s; }
.v-card:hover { border-color: var(--border-light); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
.v-card.inactive { opacity: 0.6; filter: grayscale(0.5); }

.v-card-inner { display: flex; padding: 16px; min-height: 140px; }
.v-left { width: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: 8px; color: var(--accent); }

.v-right { flex: 1; padding-left: 16px; }
.v-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.v-tag { font-size: 10px; font-weight: 700; background: var(--accent-soft); color: var(--accent); padding: 2px 8px; border-radius: 4px; }
.v-status { font-size: 10px; font-weight: 700; }
.v-status.active { color: var(--green); }
.v-status.inactive { color: var(--text-muted); }

.v-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.v-code { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; }
.v-code span { color: var(--accent); font-weight: 700; font-family: monospace; border-bottom: 1px dashed var(--accent); }

.v-details { display: flex; flex-direction: column; gap: 4px; }
.v-detail-item { font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }

.v-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 16px; border-top: 1px solid var(--border); background: rgba(0,0,0,0.05); }
.v-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.v-btn:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--border-light); }
.v-btn.danger:hover { color: var(--red); border-color: var(--red); }
</style>
