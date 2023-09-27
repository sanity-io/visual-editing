<template>
  <slot />
</template>

<script lang="ts" setup>
import { DisableVisualEditing, enableVisualEditing } from '@sanity/overlays'

let disable: DisableVisualEditing
onMounted(() => (disable = enableVisualEditing()))
onUnmounted(() => disable())
</script>
