<template>
  <p>{{ config.public.vercel.env || 'development' }}</p>
  <p>{{ projectId }}</p>
  <p>{{ price }}</p>
</template>

<script setup lang="ts">
import { projectId } from 'apps-common/env'
import { formatCurrency } from 'apps-common/utils'

const price = formatCurrency(1000)
const config = useRuntimeConfig()
</script>
