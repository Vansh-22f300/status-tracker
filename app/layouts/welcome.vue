<template>
  <div class="layout">
    <topbar />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup></script>

<style scoped>
.layout {
  min-height: 100vh;
}

.main-content {
  width: 100%;
}
</style>
