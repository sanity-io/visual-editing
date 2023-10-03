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
        @open="onOpen(element.sanity)"
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
  SanityNode,
  SanityNodeLegacy,
} from '@sanity/overlays'
import { ChannelReturns, createChannel } from 'channels'
import { createDispatchHandler } from '@/util/createDispatchHandler'

type ChannelMsg = {
  type: 'overlay/focus'
  data: any
}

let overlayController: OverlayController | undefined
const overlayEl = ref<HTMLElement | null>(null)

const channel = ref<ChannelReturns<ChannelMsg> | undefined>()
const elements = ref<ElementState[]>([])

const props = withDefaults(
  defineProps<{
    enabled?: boolean
  }>(),
  {
    enabled: true,
  },
)

function disable() {
  overlayController?.destroy()
}

function enable() {
  overlayController = createOverlayController({
    handler: createDispatchHandler(elements),
    overlayElement: overlayEl.value!,
  })
}

// Use onMounted/onUnmounted hooks for SSR safety
// Enable if enabled prop is true on component mount
onMounted(() => props.enabled && enable())
onMounted(() => {
  channel.value = createChannel<ChannelMsg>({
    id: 'overlays',
    connections: [
      {
        target: parent,
        id: 'composer',
      },
    ],
    handler(type, data) {
      console.log(type, data)
    },
  })
})
// Cleanup on unmount
onUnmounted(() => disable())
onUnmounted(() => channel.value?.disconnect())

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

const onOpen = (sanityData: SanityNode | SanityNodeLegacy) => {
  channel?.value?.send('overlay/focus', { data: toRaw(sanityData) })
}
</script>
