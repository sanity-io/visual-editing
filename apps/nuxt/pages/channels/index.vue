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
import {ChannelsController, ChannelsChannel} from '@repo/channels'

interface Msg {
  type: 'event'
  data: {
    datetime: string
  }
}

interface ParentAPI {
  id: 'controller'
  sends: Msg
  nodes: {
    id: 'parent'
    message: Msg
  }
}

const log = ref<any[]>([])
const controller = ref<ChannelsController<ParentAPI>>()
const channel = ref<ChannelsChannel<ParentAPI>>()
const iframeEl = ref<HTMLIFrameElement | undefined>()

onMounted(async () => {
  controller.value = new ChannelsController<ParentAPI>({
    id: 'controller',
    targetOrigin: 'same-origin',
  })
  controller.value.addSource(iframeEl.value!.contentWindow!)
  const {channel: _channel} = controller.value.createChannel({
    id: 'parent',
  })
  channel.value = _channel
})

onUnmounted(() => {
  controller.value?.destroy()
  controller.value = undefined
})

const sendMessage = () => {
  channel.value?.get('event', {
    datetime: new Date().toISOString(),
  })
}
</script>

<style lang="postcss"></style>
