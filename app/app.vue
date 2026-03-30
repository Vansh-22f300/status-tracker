<template>
  <div>
    <div class="layout">
      <nav>
        <sidebar></sidebar>
      </nav>

      <div class="main-content">
        <topbar></topbar>
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style>
body {
  margin: 0;
  /* font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; */
  background-color: rgb(238, 238, 227);
}

.layout {
  display: flex;
  min-height: 100vh;
}
.main-content {
  width: 100%;
}
</style>
