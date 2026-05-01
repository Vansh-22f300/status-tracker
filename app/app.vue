<template>
  <div>
    <div v-if="!isLoaded" class="loader-container">
      <div class="spinner"></div>
    </div>
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { isLoaded } = useUser();
</script>

<style>
.loader-container {
  position: fixed;
  inset: 0;
  background-color: var(--color-bg);
  display: grid;
  place-items: center;
  z-index: 999999;
}
.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border: 4px solid rgba(30, 155, 102, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
