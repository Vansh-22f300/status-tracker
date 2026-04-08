<template>
  <div class="layout">
    <nav>
      <sidebar />
    </nav>

    <div class="main-content">
      <topbar />
      <slot />  
    </div>
  </div>
</template>


  <script setup>

  </script>

  <style scoped>

  .layout {
    display: flex;
    min-height: 100vh;
  }
  .main-content {
    width: 100%;
  }
  </style>