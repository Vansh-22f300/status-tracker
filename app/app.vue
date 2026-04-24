<template>
  <div v-if="!isLoaded" class="loader-container">
    <ClipLoader :loading="true" color="#5dc596" size="85px" />
  </div>

  <NuxtLayout v-if="isLoaded">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const { isLoaded } = useUser();
import { ClipLoader } from "vue-spinner";
</script>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background-color: rgb(238, 238, 227);
  box-sizing: border-box;
}

.loader-container {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 999999;
  pointer-events: none;
  animation: loader 1.5s ease-in-out infinite;
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
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
</style>
