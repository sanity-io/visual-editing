<template>
  <div class="flex h-screen gap-px bg-black">
    <iframe ref="iframeEl" class="h-full w-full bg-white" src="/channels/child" />
    <div class="h-full w-full bg-white p-8">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-bold">Presentation</h1>
        <button
          class="rounded bg-green-500 p-2 leading-none text-white"
          type="button"
          @click.prevent="sendMessage"
        >
          Send
        </button>
      </div>
      <div class="mt-4 rounded-lg bg-purple-200 p-4">
        <pre class="text-xs">{{ log }}</pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {createChannelsController, type ChannelsController} from '@repo/channels'

const log = ref<any[]>([])
const channel = ref<ChannelsController | undefined>()
const iframeEl = ref<HTMLIFrameElement | undefined>()

onMounted(async () => {
  channel.value = createChannelsController({
    id: 'parent',
    frame: iframeEl.value!,
    frameOrigin: 'same-origin',
    connectTo: [
      {
        id: 'child',
      },
    ],
    onEvent(type, data) {
      log.value.unshift({...data, type})
    },
  })
})

onUnmounted(() => {
  channel.value?.destroy()
  channel.value = undefined
})

const sendMessage = () => {
  channel.value?.send('child', 'parent/event', {
    datetime: new Date().toISOString(),
  })
}
</script>

<style lang="postcss"></style>
