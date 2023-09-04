<template>
  <slot />
</template>

<script lang="ts" setup>
/*
  Renderless component wrapper for Visual Editing
  This is a non-Nuxt specific implementation so could be used in any Vue 3 application
*/
import { DisableVisualEditing, enableVisualEditing } from '@sanity/overlays'

const props = defineProps<{
  enabled: boolean
}>()

let disable: DisableVisualEditing | undefined

function enable() {
  disable = enableVisualEditing()
}

// Use onMounted/onUnmounted hooks for SSR safety
// Enable if enabled prop is true on component mount
onMounted(() => props.enabled && enable())
// Cleanup on unmount
onUnmounted(() => disable?.())

// React to prop change whilst component is alive
watch(
  () => props.enabled,
  (enabled) => {
    if (enabled) {
      enable()
    } else {
      disable?.()
    }
  },
)
</script>
