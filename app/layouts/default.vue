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



<script>
export default {

}
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