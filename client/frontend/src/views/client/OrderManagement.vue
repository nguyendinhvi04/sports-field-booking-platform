<template>
  <div class="customer-bookings">
    <!-- Header thông tin khách hàng -->
    <div class="user-header">
      <div class="user-avatar">{{ userInitials }}</div>
      <div class="user-info">
        <h2>{{ userName }}</h2>
        <p>{{ userPhone }}</p>
      </div>
      <div class="stats">
        <div class="stat">
          <span class="stat-number">{{ orders.length }}</span>
          <span class="stat-label">Tổng đơn</span>
        </div>
        <div class="stat">
          <span class="stat-number">{{ totalSpentFormatted }}</span>
          <span class="stat-label">Đã chi</span>
        </div>
        <div class="stat">
          <span class="stat-number">{{ pendingCount }}</span>
          <span class="stat-label">Chờ XN</span>
        </div>
      </div>
    </div>

    <!-- Bộ lọc (chỉ trạng thái + ngày) -->
    <div class="filters">
      <select v-model="statusFilter">
        <option value="all">Tất cả trạng thái</option>
        <option value="pending">Chờ xác nhận</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="completed">Hoàn thành</option>
        <option value="cancelled">Đã huỷ</option>
      </select>
      <input type="date" v-model="dateFrom" placeholder="Từ ngày" />
      <input type="date" v-model="dateTo" placeholder="Đến ngày" />
      <button v-if="hasFilter" @click="resetFilters">Xoá lọc</button>
    </div>

    <!-- Danh sách đơn dạng card (grid) -->
    <div class="orders-grid">
      <div v-for="order in paginatedOrders" :key="order.id" class="order-card" :class="order.status">
        <div class="card-header">
          <span class="order-code">{{ order.code }}</span>
          <span class="order-status" :class="order.status">{{ statusLabel(order.status) }}</span>
        </div>
        <div class="card-body">
          <div class="court">{{ order.court }}</div>
          <div class="datetime">
            <span>{{ order.date }}</span>
            <span>{{ order.timeSlot }}</span>
          </div>
          <div class="total">{{ formatPrice(order.total) }}đ</div>
        </div>
        <div class="card-actions">
          <button @click="openDetail(order)">Chi tiết</button>
          <button v-if="order.status === 'pending'" @click="confirmCancel(order)">Hủy đơn</button>
          <button @click="rebookOrder(order)">Đặt lại</button>
        </div>
      </div>
      <div v-if="filteredOrders.length === 0" class="empty">
        Không có đơn đặt sân nào
      </div>
    </div>

    <!-- Phân trang -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="currentPage--" :disabled="currentPage === 1">‹</button>
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">›</button>
    </div>

    <!-- Drawer chi tiết (giữ nguyên từ trước) -->
    <transition name="drawer">
      <div v-if="detailOrder" class="drawer-overlay" @click.self="detailOrder = null">
        <div class="drawer">
          <div class="drawer-header">
            <div>
              <div class="drawer-title">Chi tiết đơn</div>
              <div class="drawer-code">{{ detailOrder.code }}</div>
            </div>
            <button @click="detailOrder = null">✕</button>
          </div>
          <div class="drawer-body">
            <div class="row"><label>Sân:</label><span>{{ detailOrder.court }}</span></div>
            <div class="row"><label>Ngày:</label><span>{{ detailOrder.date }} - {{ detailOrder.timeSlot }}</span></div>
            <div class="row"><label>PTTT:</label><span>{{ payLabel(detailOrder.payMethod) }}</span></div>
            <div class="row" v-if="detailOrder.services?.length"><label>Dịch vụ:</label><span>{{ detailOrder.services.join(', ') }}</span></div>
            <div class="row"><label>Tổng tiền:</label><span class="total">{{ formatPrice(detailOrder.total) }}đ</span></div>
            <div class="timeline" v-if="detailOrder.timeline">
              <div class="timeline-title">Lịch sử</div>
              <div v-for="(ev, idx) in detailOrder.timeline" :key="idx" class="timeline-item">
                <div class="dot"></div>
                <div><strong>{{ ev.label }}</strong><br><small>{{ ev.time }}</small></div>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <button v-if="detailOrder.status === 'pending'" @click="cancelOrder(detailOrder); detailOrder=null">Hủy đơn</button>
            <button @click="rebookOrder(detailOrder); detailOrder=null">Đặt lại</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast + Confirm dialog (giống cũ) -->
    <div class="toasts">
      <div v-for="t in toasts" :key="t.id" class="toast">{{ t.msg }}</div>
    </div>
    <div v-if="cancelTarget" class="confirm-overlay" @click.self="cancelTarget=null">
      <div class="confirm-dialog">
        <p>Xác nhận huỷ đơn <strong>{{ cancelTarget.code }}</strong>?</p>
        <div class="confirm-buttons">
          <button @click="cancelTarget=null">Quay lại</button>
          <button @click="proceedCancel">Huỷ đơn</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerBookings',
  data() {
    // Dữ liệu mẫu (đơn hàng của user hiện tại)
    const currentUser = { name: 'Nguyễn Văn An', phone: '0901234567' };
    const courts = ['Sân 7 – Số 1', 'Sân 7 – Số 2', 'Sân 11 – Chính'];
    const timeSlots = ['16:30 – 18:00', '18:00 – 20:00', '19:00 – 20:30', '20:00 – 21:00'];
    const dates = ['25/03/2026', '27/03/2026', '28/03/2026', '29/03/2026', '24/03/2026'];
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const payMethods = ['bank', 'momo', 'vnpay', 'card', 'cash'];

    const orders = Array.from({ length: 12 }, (_, i) => {
      const status = statuses[i % statuses.length];
      const court = courts[i % courts.length];
      const baseTotal = court.includes('11') ? 1200000 : 450000;
      const svcExtra = (i % 3) * 80000;
      return {
        id: i+1,
        code: `TP${3000+i}`,
        name: currentUser.name,
        phone: currentUser.phone,
        court,
        date: dates[i % dates.length],
        timeSlot: timeSlots[i % timeSlots.length],
        payMethod: payMethods[i % payMethods.length],
        total: baseTotal + svcExtra,
        status,
        services: i % 2 === 0 ? ['Nước uống'] : [],
        timeline: status === 'completed' ? [{ label: 'Hoàn thành', time: '10:00 28/03' }] : [{ label: 'Đặt sân', time: '08:30 27/03' }]
      };
    });

    return {
      orders,
      currentUser,
      statusFilter: 'all',
      dateFrom: '',
      dateTo: '',
      currentPage: 1,
      pageSize: 6,
      detailOrder: null,
      toasts: [],
      cancelTarget: null,
    };
  },
  computed: {
    userName() { return this.currentUser.name; },
    userPhone() { return this.currentUser.phone; },
    userInitials() { return this.userName.split(' ').map(n=>n[0]).join('').slice(0,2); },
    totalSpent() { return this.orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total,0); },
    totalSpentFormatted() { return this.formatPrice(this.totalSpent); },
    pendingCount() { return this.orders.filter(o=>o.status==='pending').length; },
    filteredOrders() {
      let list = [...this.orders];
      if (this.statusFilter !== 'all') list = list.filter(o => o.status === this.statusFilter);
      if (this.dateFrom) {
        const from = this.dateFrom.split('-').reverse().join('/');
        list = list.filter(o => o.date >= from);
      }
      if (this.dateTo) {
        const to = this.dateTo.split('-').reverse().join('/');
        list = list.filter(o => o.date <= to);
      }
      return list.sort((a,b)=>b.id - a.id);
    },
    totalPages() { return Math.ceil(this.filteredOrders.length / this.pageSize); },
    paginatedOrders() {
      const start = (this.currentPage-1)*this.pageSize;
      return this.filteredOrders.slice(start, start+this.pageSize);
    },
    hasFilter() { return this.statusFilter !== 'all' || this.dateFrom || this.dateTo; }
  },
  methods: {
    formatPrice(v) { return new Intl.NumberFormat('vi-VN').format(v); },
    statusLabel(s) { return { pending:'Chờ xác nhận', confirmed:'Đã xác nhận', completed:'Hoàn thành', cancelled:'Đã huỷ' }[s]; },
    payLabel(p) { return { bank:'Chuyển khoản', momo:'MoMo', vnpay:'VNPAY', card:'Thẻ QT', cash:'Tiền mặt' }[p]; },
    resetFilters() { this.statusFilter='all'; this.dateFrom=''; this.dateTo=''; this.currentPage=1; },
    openDetail(o) { this.detailOrder = {...o}; },
    confirmCancel(o) { this.cancelTarget = o; },
    proceedCancel() {
      const idx = this.orders.findIndex(o=>o.id===this.cancelTarget.id);
      if (idx !== -1 && this.orders[idx].status === 'pending') {
        this.orders[idx].status = 'cancelled';
        this.toast('Đã huỷ đơn ' + this.cancelTarget.code);
      } else this.toast('Không thể huỷ đơn này', 'error');
      this.cancelTarget = null;
      if (this.detailOrder?.id === this.cancelTarget?.id) this.detailOrder = null;
    },
    cancelOrder(o) { this.confirmCancel(o); },
    rebookOrder(o) { this.toast(`Đặt lại sân ${o.court} - ${o.date}`); },
    toast(msg, type='success') {
      const id = Date.now();
      this.toasts.push({ id, msg });
      setTimeout(()=> this.toasts = this.toasts.filter(t=>t.id!==id), 2500);
    }
  }
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }
.customer-bookings {
  font-family: 'Lexend', sans-serif;
  background: #f1f5f9;
  min-height: 100vh;
  padding: 20px;
}

/* User header */
.user-header {
  background: white;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.user-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg,#0f172a,#1e3a5f);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 22px;
}
.user-info h2 { font-size: 18px; margin-bottom: 4px; }
.user-info p { color: #64748b; font-size: 13px; }
.stats { display: flex; gap: 24px; margin-left: auto; }
.stat { text-align: right; }
.stat-number { font-weight: 800; font-size: 20px; display: block; }
.stat-label { font-size: 11px; color: #64748b; }

/* Filters */
.filters {
  background: white;
  border-radius: 20px;
  padding: 12px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.filters select, .filters input {
  border: 1.5px solid #e2e8f0;
  border-radius: 40px;
  padding: 8px 16px;
  background: #f8fafc;
  font-family: inherit;
}
.filters button {
  background: #fee2e2;
  border: none;
  border-radius: 40px;
  padding: 8px 16px;
  font-weight: 700;
  color: #dc2626;
  cursor: pointer;
}

/* Card grid */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.order-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 18px;
  transition: 0.2s;
}
.order-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.order-code {
  font-weight: 800;
  font-family: monospace;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 13px;
}
.order-status {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 30px;
}
.order-status.pending { background: #fef3c7; color: #b45309; }
.order-status.confirmed { background: #dbeafe; color: #1e40af; }
.order-status.completed { background: #dcfce7; color: #166534; }
.order-status.cancelled { background: #fee2e2; color: #991b1b; }

.card-body .court { font-weight: 800; font-size: 16px; margin-bottom: 6px; }
.datetime { display: flex; gap: 12px; font-size: 13px; color: #64748b; margin-bottom: 12px; }
.total { font-weight: 900; font-size: 18px; color: #16a34a; }

.card-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
.card-actions button {
  flex: 1;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  padding: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.card-actions button:first-child { color: #3b82f6; border-color: #bfdbfe; }
.card-actions button:first-child:hover { background: #eff6ff; }
.card-actions button:nth-child(2) { color: #dc2626; border-color: #fecaca; }
.card-actions button:nth-child(2):hover { background: #fee2e2; }
.card-actions button:last-child { color: #16a34a; border-color: #bbf7d0; }
.card-actions button:last-child:hover { background: #dcfce7; }

.empty { grid-column: 1/-1; text-align: center; padding: 60px; background: white; border-radius: 20px; }

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
}
.pagination button {
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 30px;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 700;
}
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

/* Drawer (giống cũ nhưng đơn giản hóa) */
.drawer-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px); display: flex; justify-content: flex-end; z-index: 1000;
}
.drawer {
  width: 400px; max-width: 90vw; background: white; height: 100vh;
  display: flex; flex-direction: column; box-shadow: -4px 0 20px rgba(0,0,0,0.1);
}
.drawer-header {
  display: flex; justify-content: space-between; padding: 20px; border-bottom: 1px solid #e2e8f0;
}
.drawer-title { font-weight: 800; font-size: 18px; }
.drawer-code { font-size: 12px; color: #64748b; }
.drawer-header button { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; }
.drawer-body { flex: 1; padding: 20px; overflow-y: auto; }
.row { display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.row .total { font-weight: 900; color: #16a34a; font-size: 18px; }
.timeline-title { font-weight: 700; margin: 16px 0 8px; }
.timeline-item { display: flex; gap: 12px; margin-bottom: 12px; }
.dot { width: 8px; height: 8px; background: #22c55e; border-radius: 10px; margin-top: 4px; }
.drawer-footer {
  padding: 16px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px;
}
.drawer-footer button { flex: 1; padding: 10px; border-radius: 40px; border: none; font-weight: 700; cursor: pointer; }
.drawer-footer button:first-child { background: #dc2626; color: white; }
.drawer-footer button:last-child { background: #f1f5f9; }

/* Toast + Confirm */
.toasts { position: fixed; bottom: 20px; right: 20px; z-index: 1100; }
.toast { background: #0f172a; color: white; padding: 8px 16px; border-radius: 40px; margin-top: 8px; }
.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1200;
}
.confirm-dialog {
  background: white; border-radius: 24px; padding: 24px; width: 300px; text-align: center;
}
.confirm-buttons { display: flex; gap: 12px; margin-top: 20px; }
.confirm-buttons button { flex: 1; padding: 10px; border-radius: 40px; border: none; font-weight: 700; cursor: pointer; }
.confirm-buttons button:first-child { background: #f1f5f9; }
.confirm-buttons button:last-child { background: #dc2626; color: white; }

.drawer-enter-active, .drawer-leave-active { transition: opacity 0.3s; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform 0.3s; }
.drawer-enter-from .drawer { transform: translateX(100%); }
.drawer-leave-to .drawer { transform: translateX(100%); }

@media (max-width: 640px) {
  .customer-bookings { padding: 12px; }
  .stats { margin-left: 0; width: 100%; justify-content: space-between; }
  .filters { flex-direction: column; align-items: stretch; }
}
</style>