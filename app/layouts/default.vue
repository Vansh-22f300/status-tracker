<template>
  <div class="layout">
    <div class="sidebar-overlay" v-if="sidebarOpen" @click="sidebarClose"></div>

    <nav :class="{ 'sidebar-open': sidebarOpen }">
      <sidebar />
    </nav>

    <div class="main-content">
      <topbar />
      <slot />
    </div>
  </div>
</template>

<script setup>
const { sidebarOpen, sidebarClose } = useSidebar();
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.main-content {
  width: 100%;
  backdrop-filter: saturate(130%) blur(2px);
}
.sidebar-overlay {
  display: none;
}
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  .main-content {
    width: 100%;
  }
  nav {
    position: fixed;
    left: 0;
    top: 0;
    height: 100dvh;
    max-height: 100dvh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    /* max-width: 85%; */
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  nav.sidebar-open {
    transform: translateX(0);
  }
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(11, 21, 34, 0.45);
    backdrop-filter: blur(2px);
    z-index: 199;
  }
}
</style>
