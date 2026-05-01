<template>
  <div class="auth">
    <slot />
  </div>
</template>

<script setup></script>

<style scoped>
.auth {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(30, 155, 102, 0.12),
      transparent 35%
    ),
    radial-gradient(circle at 0% 100%, rgba(38, 76, 125, 0.12), transparent 35%);
}
</style>
