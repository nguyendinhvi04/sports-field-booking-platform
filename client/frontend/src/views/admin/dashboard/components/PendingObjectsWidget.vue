<template>
  <div class="pending-widget">
    <div class="widget-header">
      <div class="widget-title">Đang chờ xử lý</div>
      <router-link to="/admin/courts/pending" class="view-all">Xem tất cả</router-link>
    </div>
    <div class="pending-list">
      <div v-for="item in items" :key="item.id" class="pending-item">
        <div class="item-icon" :class="item.type">
          <component :is="item.icon" :size="16" />
        </div>
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-meta">{{ item.time }} • {{ item.subtitle }}</div>
        </div>
        <div class="item-action">
          <button class="btn-check"><Check :size="14" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Check, MapPin, ShieldCheck } from 'lucide-vue-next';

export default {
  name: 'PendingObjectsWidget',
  components: { Check, MapPin, ShieldCheck },
  props: {
    items: {
      type: Array,
      default: () => [
        { id: 1, type: 'court', icon: 'MapPin', name: 'Sân bóng HT', subtitle: 'Sân bóng đá', time: '10 phút trước' },
        { id: 2, type: 'kyc', icon: 'ShieldCheck', name: 'Nguyễn Văn A', subtitle: 'Xác minh chủ sân', time: '2 giờ trước' },
        { id: 3, type: 'court', icon: 'MapPin', name: 'Sân Cầu Lông ĐN', subtitle: 'Sân cầu lông', time: '5 giờ trước' }
      ]
    }
  }
}
</script>

<style scoped>
.pending-widget { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; height: 100%; }
.widget-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.widget-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.view-all { font-size: 12px; color: var(--accent); text-decoration: none; font-weight: 500; }

.pending-list { display: flex; flex-direction: column; gap: 16px; }
.pending-item { display: flex; align-items: center; gap: 12px; }

.item-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.item-icon.court { background: var(--green-soft); color: var(--green); }
.item-icon.kyc { background: var(--accent-soft); color: var(--accent); }

.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-meta { font-size: 11px; color: var(--text-muted); }

.btn-check { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-check:hover { background: var(--green-soft); color: var(--green); border-color: var(--green); }
</style>
