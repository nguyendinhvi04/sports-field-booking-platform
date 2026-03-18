<template>
  <div class="owner-layout">
    <OwnerSidebar :is-collapsed="isSidebarCollapsed" />
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <OwnerHeader @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />
      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import OwnerSidebar from '../components/layout/OwnerSidebar.vue';
import OwnerHeader from '../components/layout/OwnerHeader.vue';

export default {
  name: 'OwnerLayout',
  components: {
    OwnerSidebar,
    OwnerHeader
  },
  data() {
    return {
      isSidebarCollapsed: false
    }
  }
}
</script>

<style scoped>
.owner-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Barlow', sans-serif;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 280px; /* Width of sidebar */
  min-width: 0;
}

.main-wrapper.sidebar-collapsed {
  margin-left: 80px;
}

.content-area {
  padding: 30px;
  flex: 1;
  overflow-y: auto;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .main-wrapper {
    margin-left: 0 !important;
  }
}
</style>
