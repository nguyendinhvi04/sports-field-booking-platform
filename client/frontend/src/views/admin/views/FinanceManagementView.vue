<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">
        <Wallet :size="24" class="title-icon" />
        Quản lý Tài chính & Hoàn tiền
        <span class="count">{{ pendingRefunds }} yêu cầu hoàn tiền</span>
      </div>
      <div class="page-subtitle">Theo dõi luồng tiền, đối soát giao dịch và xử lý các yêu cầu hoàn trả từ khách hàng</div>
    </div>

    <!-- Quick Stats -->
    <div class="finance-stats">
      <div class="f-stat-card primary">
        <div class="f-stat-label">Tổng doanh thu hệ thống</div>
        <div class="f-stat-value">₫142.500.000</div>
        <div class="f-stat-desc">Tháng này: +12% so với tháng trước</div>
      </div>
      <div class="f-stat-card success">
        <div class="f-stat-label">Giao dịch thành công</div>
        <div class="f-stat-value">1.482</div>
        <div class="f-stat-desc">Tỉ lệ thanh toán online: 82%</div>
      </div>
      <div class="f-stat-card warning">
        <div class="f-stat-label">Yêu cầu hoàn tiền</div>
        <div class="f-stat-value">{{ pendingRefunds }}</div>
        <div class="f-stat-desc">Đang chờ Admin/Owner xét duyệt</div>
      </div>
    </div>

    <!-- Tabs & Table -->
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
          <input type="text" v-model="searchQuery" placeholder="Mã giao dịch, tên khách hàng..." />
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Giao dịch</th>
              <th>Khách hàng</th>
              <th>Phương thức</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Ngày GD</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredPayments" :key="p.id">
              <td>
                <div class="tx-cell">
                  <div class="tx-code">{{ p.transactionRef }}</div>
                  <div class="tx-sub">Booking: {{ p.bookingId }}</div>
                </div>
              </td>
              <td>
                <div class="user-cell">
                  <span class="user-name">{{ p.customerName }}</span>
                </div>
              </td>
              <td>
                <div class="method-pill" :class="p.method.toLowerCase()">{{ p.method }}</div>
              </td>
              <td class="font-bold">{{ formatPrice(p.amount) }}</td>
              <td>
                <div class="status-badge" :class="p.status.toLowerCase()">
                   <div class="dot"></div>
                   {{ statusLabels[p.status] }}
                </div>
                <div v-if="p.refundStatus !== 'NONE'" class="refund-sub">
                   Yêu cầu hoàn tiền: <span :class="p.refundStatus.toLowerCase()">{{ refundLabels[p.refundStatus] }}</span>
                </div>
              </td>
              <td>{{ p.createdAt }}</td>
              <td>
                <div class="row-actions justify-end">
                  <button v-if="p.refundStatus === 'REQUESTED'" class="row-btn warning" title="Xử lý hoàn tiền" @click="handleRefund(p)">
                    <Undo2 :size="14" />
                  </button>
                  <button class="row-btn" title="Xem chứng từ">
                    <Image :size="14" v-if="p.proofImageUrl" />
                    <FileText :size="14" v-else />
                  </button>
                  <button class="row-btn" title="Chi tiết">
                    <Eye :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Refund Modal (Mockup) -->
    <div v-if="showRefundModal" class="modal-overlay" @click="showRefundModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Xử lý yêu cầu hoàn tiền #{{ selectedPayment?.transactionRef }}</h3>
          <button class="close-btn" @click="showRefundModal = false"><X :size="20" /></button>
        </div>
        <div class="modal-body">
          <div class="refund-info-box">
             <div class="r-label">Lý do hoàn tiền:</div>
             <div class="r-value">{{ selectedPayment?.refundReason }}</div>
          </div>
          <div class="input-group mt-4">
             <label>Số tiền hoàn trả (VNĐ)</label>
             <input type="number" v-model="refundAmount" class="form-input" />
             <p class="hint">Tối đa: {{ formatPrice(selectedPayment?.amount) }}</p>
          </div>
          <div class="input-group mt-4">
             <label>Ghi chú phản hồi</label>
             <textarea v-model="refundNote" class="form-input" placeholder="Lý do chấp nhận hoặc từ chối..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn danger ghost" @click="rejectRefundAction">Từ chối hoàn tiền</button>
          <button class="action-btn success shadow" @click="approveRefundAction">Chấp nhận & Hoàn tiền</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { 
  Wallet, Search, Undo2, Image, FileText, 
  Eye, Check, X, AlertCircle 
} from 'lucide-vue-next';

export default {
  name: 'FinanceManagementView',
  components: {
    Wallet, Search, Undo2, Image, FileText, Eye, X
  },
  setup() {
    const activeTab = ref('all');
    const searchQuery = ref('');
    const showRefundModal = ref(false);
    const selectedPayment = ref(null);
    const refundAmount = ref(0);
    const refundNote = ref('');

    const tabs = [
      { id: 'all', label: 'Tất cả giao dịch' },
      { id: 'refund', label: 'Yêu cầu hoàn tiền' },
      { id: 'success', label: 'Đã hoàn tất' }
    ];

    const statusLabels = {
      CONFIRMED: 'Thành công',
      PENDING: 'Đang xử lý',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền'
    };

    const refundLabels = {
      REQUESTED: 'Đang chờ',
      APPROVED: 'Đã duyệt',
      COMPLETED: 'Đã hoàn thành',
      REJECTED: 'Từ chối'
    };

    const payments = ref([
      { id: '1', transactionRef: 'TX882910', bookingId: 'BK123', customerName: 'Nguyễn Văn Hải', method: 'MOMO', amount: 350000, status: 'CONFIRMED', refundStatus: 'REQUESTED', refundReason: 'Sân bị ngập nước không đá được', proofImageUrl: 'link', createdAt: '30/03/2026 09:12' },
      { id: '2', transactionRef: 'TX882911', bookingId: 'BK124', customerName: 'Lê Thị Tâm', method: 'BANK_TRANSFER', amount: 150000, status: 'CONFIRMED', refundStatus: 'NONE', createdAt: '30/03/2026 10:05' },
      { id: '3', transactionRef: 'TX882912', bookingId: 'BK125', customerName: 'Trần Minh Quân', method: 'VNPAY', amount: 200000, status: 'REFUNDED', refundStatus: 'COMPLETED', createdAt: '28/03/2026 14:30' },
    ]);

    const pendingRefunds = computed(() => payments.value.filter(p => p.refundStatus === 'REQUESTED').length);

    const filteredPayments = computed(() => {
      let filtered = payments.value;
      if (activeTab.value === 'refund') filtered = filtered.filter(p => p.refundStatus !== 'NONE');
      if (activeTab.value === 'success') filtered = filtered.filter(p => p.status === 'CONFIRMED');
      
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        filtered = filtered.filter(p => p.transactionRef.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q));
      }
      return filtered;
    });

    const formatPrice = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const handleRefund = (p) => {
      selectedPayment.value = p;
      refundAmount.value = p.amount;
      showRefundModal.value = true;
    };

    const approveRefundAction = () => {
      if(confirm('Bạn có chắc chắn duyệt hoàn tiền này? Tiền sẽ được trả lại ví/tài khoản khách hàng.')) {
        selectedPayment.value.status = 'REFUNDED';
        selectedPayment.value.refundStatus = 'COMPLETED';
        showRefundModal.value = false;
      }
    };

    const rejectRefundAction = () => {
      if(confirm('Từ chối yêu cầu hoàn tiền?')) {
        selectedPayment.value.refundStatus = 'REJECTED';
        showRefundModal.value = false;
      }
    };

    return {
      activeTab, searchQuery, tabs, filteredPayments,
      statusLabels, refundLabels, pendingRefunds, formatPrice,
      showRefundModal, selectedPayment, refundAmount, refundNote,
      handleRefund, approveRefundAction, rejectRefundAction
    };
  }
}
</script>

<style scoped>
.finance-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
.f-stat-card { border-radius: 12px; padding: 20px; border: 1px solid var(--border); background: var(--bg-secondary); }
.f-stat-card.primary { border-left: 4px solid var(--accent); }
.f-stat-card.success { border-left: 4px solid var(--green); }
.f-stat-card.warning { border-left: 4px solid var(--orange); }

.f-stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
.f-stat-value { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.f-stat-desc { font-size: 11px; color: var(--text-muted); }

.tx-cell { display: flex; flex-direction: column; }
.tx-code { font-weight: 600; color: var(--text-primary); font-family: monospace; font-size: 13.5px; }
.tx-sub { font-size: 11px; color: var(--text-muted); }

.user-name { font-weight: 500; font-size: 13.5px; }

.method-pill { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; display: inline-block; background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border); }
.method-pill.momo { color: #d82d8b; border-color: rgba(216,45,139,0.2); }
.method-pill.vnpay { color: #005baa; border-color: rgba(0,91,170,0.2); }

.refund-sub { font-size: 10.5px; margin-top: 4px; }
.refund-sub span.requested { color: var(--orange); font-weight: 600; }
.refund-sub span.completed { color: var(--green); font-weight: 600; }

/* Statuses */
.status-badge.confirmed { color: var(--green); } .status-badge.confirmed .dot { background: var(--green); }
.status-badge.refunded { color: var(--purple); } .status-badge.refunded .dot { background: var(--purple); }

/* Modal specific */
.refund-info-box { background: var(--bg-tertiary); padding: 12px; border-radius: 8px; border: 1px solid var(--border); }
.r-label { font-size: 11px; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; }
.r-value { font-size: 13.5px; color: var(--text-primary); }

.form-input { width: 100%; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-size: 14px; outline: none; margin-top: 6px; }
.form-input:focus { border-color: var(--accent); }
.hint { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.mt-4 { margin-top: 16px; }

.action-btn.success.shadow { box-shadow: 0 4px 12px rgba(34,197,94,0.3); }
</style>
