<template>
  <div class="flex h-screen gap-px bg-black">
    <iframe
      ref="iframeEl"
      class="h-full w-full bg-white"
      src="/channels/child"
    />
    <div class="h-full w-full bg-white p-8">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-bold">Composer</h1>
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
import { type ChannelReturns, createChannel } from 'channels'

const log = ref<any[]>([])
const channel = ref<ChannelReturns | undefined>()
const iframeEl = ref<HTMLIFrameElement | undefined>()

onMounted(async () => {
  channel.value = createChannel({
    id: 'parent',
    connections: [
      {
        target: iframeEl.value?.contentWindow!,
        id: 'child',
      },
    ],
    handler(type, data) {
      log.value.unshift({ ...data, type })
    },
  })
})

onUnmounted(() => {
  channel.value?.disconnect()
  channel.value = undefined
})

const sendMessage = () => {
  channel.value?.send('parent/event', {
    datetime: new Date().toISOString(),
  })
}
</script>

<style lang="postcss"></style>
