<template>
  <slot />
</template>

<script lang="ts" setup>
import { type DisableOverlays, enableOverlays } from '@sanity/overlays'

let disable: DisableOverlays
const router = useRouter()

onMounted(() => {
  disable = enableOverlays({
    history: {
      subscribe: (navigate) => {
        return router.afterEach((to) => {
          // There is no mechanism to determine navigation type in a Vue Router navigation guard, so just push
          // https://github.com/vuejs/vue-router/issues/1620
          navigate({ type: 'push', url: to.fullPath })
        })
      },
      update: (update) => {
        if (update.type === 'push' || update.type === 'replace') {
          router[update.type](update.url)
        } else if (update.type === 'pop') {
          router.back()
        }
      },
    },
  })
})
onUnmounted(() => disable())
</script>
