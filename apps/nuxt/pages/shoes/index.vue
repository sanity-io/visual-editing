<template>
  <p>{{ config.public.vercel.env || 'development' }}</p>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
</script>
