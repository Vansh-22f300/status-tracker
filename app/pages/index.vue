<template>
    <status></status>
    <checkin></checkin>
    <yesterday></yesterday>
</template>

<script setup>
definePageMeta({
  middleware: ['auth'],
    layout: 'default'
})
</script>