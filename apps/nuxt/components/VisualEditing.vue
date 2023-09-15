<template>
  <slot />
  <Teleport to="body">
    <div
      ref="overlayEl"
      id="sanity-visual-editing"
      class="absolute top-0 z-[9999999]"
    >
      <ElementOverlay
        v-for="element of elements"
        :key="element.id"
        :rect="element.rect"
        :hovered="element.hovered"
        :sanity="element.sanity"
      />
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
/*
  Renderless component wrapper for Visual Editing
  This is a non-Nuxt specific implementation so could be used in any Vue 3 application
*/
import {
  createOverlayController,
  type OverlayController,
  type ElementState,
} from '@sanity/overlays'
import { createDispatchHandler } from '@/util/createDispatchHandler'

let overlayController: OverlayController | undefined
const overlayEl = ref<HTMLElement | null>(null)

const elements = ref<ElementState[]>([])

const props = defineProps<{
  enabled: boolean
}>()

const dispatch = createDispatchHandler(elements)

function disable() {
  overlayController?.destroy()
}

function enable() {
  overlayController = createOverlayController({
    dispatch,
    overlayElement: overlayEl.value!,
  })
}

// Use onMounted/onUnmounted hooks for SSR safety
// Enable if enabled prop is true on component mount
onMounted(() => props.enabled && enable())
// Cleanup on unmount
onUnmounted(() => disable())

// React to prop change whilst component is alive
watch(
  () => props.enabled,
  (enabled) => {
    if (enabled) {
      enable()
    } else {
      disable()
    }
  },
)
</script>
