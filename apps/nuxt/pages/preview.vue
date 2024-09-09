<template>
  <main>
    <nav
      class="sticky top-0 flex items-center gap-1 border-b border-gray-300 bg-white p-2 text-gray-600"
    >
      <div class="p-2 text-sm leading-none">Router:</div>
      <NuxtLink
        class="rounded p-2 leading-none hover:bg-gray-200"
        exact-active-class="bg-gray-200"
        to="/preview"
        >Parent</NuxtLink
      >
      <NuxtLink
        class="rounded p-2 leading-none hover:bg-gray-200"
        exact-active-class="bg-gray-200"
        to="/preview/child"
        >Child</NuxtLink
      >
      <div class="border-l p-2 pl-2 text-sm leading-none">Browser:</div>
      <a
        :class="{'bg-gray-200': route.path === '/preview'}"
        class="rounded p-2 leading-none hover:bg-gray-200"
        href="/preview"
        >Parent</a
      >
      <a
        :class="{'bg-gray-200': route.path === '/preview/child'}"
        class="rounded p-2 leading-none hover:bg-gray-200"
        href="/preview/child"
        >Child</a
      >
    </nav>
    <ClientOnly>
      <VisualEditing>
        <NuxtPage />
      </VisualEditing>
    </ClientOnly>
  </main>
</template>

<script setup lang="ts">
import {enableVisualEditing, type DisableVisualEditing} from '@sanity/visual-editing'

let disable: DisableVisualEditing
onMounted(() => {
  disable = enableVisualEditing()
})
onUnmounted(() => disable())

const route = useRoute()
</script>
