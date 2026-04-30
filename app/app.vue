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
const { isLoaded } = useUser()
</script>

<style>
* { box-sizing: border-box; }
body {
  margin: 0;
  background-color: rgb(238, 238, 227);
}
.loader-container {
  position: fixed;
  inset: 0;
  display:flex;
  justify-content: center;
  align-items: center;
  background-color:rgb(238,238,227);
  display: grid;
  place-items: center;
  z-index: 999999;
}
.spinner {
  display:flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border: 4px solid rgba(93, 197, 150, 0.2);
  border-top-color: #5dc596;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  body { font-size: 14px; }
}
</style>