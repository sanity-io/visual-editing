<template>
  <div id="app" ref="studioEl" />
</template>

<script lang="ts" setup>
import {renderStudio} from 'sanity'
import getSanityConfig from '../sanity.config'

const nuxtConfig = useRuntimeConfig()
const sanityConfig = getSanityConfig(nuxtConfig.public.sanity)

const studioEl = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!studioEl.value) return
  // N.B. This doesn’t return a cleanup fn
  renderStudio(studioEl.value, sanityConfig, {
    reactStrictMode: true,
  })
})
</script>

<style scoped>
#app {
  height: 100vh;
  max-height: 100dvh;
  overscroll-behavior: none;
  -webkit-font-smoothing: antialiased;
  overflow: auto;
}
</style>
