<template>
  <p>{{ config.public.vercel.env || 'development' }}</p>
  <p>{{ price }}</p>
  <p>{{ slug }}</p>
</template>

<script setup lang="ts">
import { formatCurrency } from 'apps-common/utils'

const route = useRoute()
const slug = route.params.slug
const price = formatCurrency(1000)
const config = useRuntimeConfig()
</script>
