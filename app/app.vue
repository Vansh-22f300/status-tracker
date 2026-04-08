<template>
  <div v-if="!isLoaded" class="loader-container">
    <ClipLoader :loading="true" color="#5dc596" size="85px" />
  </div>

  <NuxtLayout v-if="isLoaded">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const { isLoaded } = useUser()

</script>

<style>
body {
  margin: 0;
  /* font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; */
  background-color: rgb(238, 238, 227);
}

.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(204, 206, 197, 0.4);
  z-index: 999;
  pointer-events: none;
}

.loader-clip {
  animation: loader 1.5s ease-in-out infinite;
}

@keyframes loader {
  0% {
    opacity: 0.3;
    transform: translateY(15px);
  }
  50% {
    opacity: 0.6;
    transform: translateY(0);
  }
  100% {
    opacity: 1;
    transform: translateY(15px);
  }
}
</style>
