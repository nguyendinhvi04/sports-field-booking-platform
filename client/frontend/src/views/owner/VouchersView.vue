<template>
  <div class="vouchers-page">
    <header class="vouchers-header card-3d">
      <div class="header-left">
        <h1 class="page-title">Chương trình khuyến mãi</h1>
        <p class="subtitle text-muted">Tạo và quản lý các mã giảm giá để thu hút người chơi</p>
      </div>
      <button class="create-btn">
        <span class="material-icons">add</span> Tạo mã mới
      </button>
    </header>

    <div class="vouchers-grid">
      <div v-for="v in vouchers" :key="v.id" class="voucher-card card-3d">
        <div class="voucher-top" :style="{ borderTopColor: v.color }">
          <div class="voucher-info">
            <h3 class="voucher-code">{{ v.code }}</h3>
            <p class="voucher-description">{{ v.description }}</p>
          </div>
          <div class="voucher-amount" :style="{ color: v.color }">
            {{ v.amount }}
          </div>
        </div>
        <div class="voucher-footer">
          <div class="voucher-stat">
            <span class="material-icons">trending_up</span>
            <span>Đã dùng: <strong>{{ v.used }} / {{ v.limit }}</strong></span>
          </div>
          <div class="voucher-expiry">
            <span class="material-icons">schedule</span>
            <span>Hết hạn: {{ v.expiry }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OwnerVouchersView',
  data() {
    return {
      vouchers: [
        { id: 1, code: 'SUMMER2026', description: 'Giảm 20% cho tất cả các sân vào buổi sáng', amount: '-20%', used: 45, limit: 100, expiry: '30/06/2026', color: '#16a34a' },
        { id: 2, code: 'NEWBIE', description: 'Giảm 50k cho đơn hàng đầu tiên', amount: '-50k', used: 128, limit: 500, expiry: 'Vô thời hạn', color: '#2563eb' },
        { id: 3, code: 'WEEKEND', description: 'Giảm 10% khi đặt sân vào Thứ 7, CN', amount: '-10%', used: 12, limit: 50, expiry: '20/05/2026', color: '#db2777' },
      ]
    }
  }
}
</script>

<style scoped>
.vouchers-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-3d {
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.card-3d:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.vouchers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title { font-size: 28px; font-weight: 800; margin: 0; }

.create-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.create-btn:hover { background: #15803d; }

.vouchers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.voucher-top {
  border-top: 4px solid #16a34a;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.voucher-code { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; }
.voucher-description { font-size: 14px; color: #64748b; margin: 4px 0 0 0; }
.voucher-amount { font-size: 24px; font-weight: 800; }

.voucher-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px dashed #e2e8f0;
  padding-top: 16px;
  font-size: 13px;
  color: #64748b;
}

.voucher-stat, .voucher-expiry {
  display: flex;
  align-items: center;
  gap: 6px;
}

.voucher-footer .material-icons { font-size: 16px; }
</style>
