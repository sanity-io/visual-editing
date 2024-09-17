<template>
  <div class="h-full w-full bg-white p-8">
    <div v-if="channel" class="flex items-center justify-between">
      <h1 class="text-lg font-bold">Channel</h1>
      <button
        v-if="channel.inFrame"
        class="rounded bg-purple-500 p-2 leading-none text-white"
        type="button"
        @click.prevent="sendMessage"
      >
        Send
      </button>
      <RouterLink
        v-else
        class="rounded bg-purple-500 p-2 leading-none text-white"
        to="/channels/parent"
      >
        Go to Parent
      </RouterLink>
    </div>
    <div v-else>Loading...</div>
    <div v-if="channel" class="mt-4 rounded-lg bg-green-200 p-4">
      <pre class="text-xs">{{ log }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {createChannelsNode, type ChannelsNode} from '@repo/channels'

interface Sends {
  type: 'child/event'
  data: {datetime: string}
}

const log = ref<any[]>([])
const channel = ref<ChannelsNode<Sends, any> | undefined>()

onMounted(() => {
  channel.value = createChannelsNode({
    id: 'child',
    connectTo: 'parent',
  })
  channel.value.subscribe((type, data) => {
    log.value.unshift({...data, type})
  })
})

onUnmounted(() => {
  channel.value?.destroy()
})

const sendMessage = () => {
  channel.value?.send('child/event', {
    datetime: new Date().toISOString(),
  })
}
</script>

<style lang="postcss"></style>
