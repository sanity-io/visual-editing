<template>
  <slot />
</template>

<script lang="ts" setup>
import { DisableVisualEditing, enableVisualEditing } from '@sanity/overlays'

let disable: DisableVisualEditing
const router = useRouter()

onMounted(() => {
  disable = enableVisualEditing({
    history: {
      push(url) {
        router.push(url)
      },
      subscribe(navigate) {
        return router.afterEach((to) => {
          navigate({ type: 'push', url: to.fullPath })
        })
      },
    },
  })
})
onUnmounted(() => disable())
</script>
