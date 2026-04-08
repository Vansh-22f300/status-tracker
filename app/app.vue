<template>
  <div v-if="!isLoaded">
      <h1>Loading</h1>
      
  </div>
  <NuxtLayout v-else>
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
</style>
