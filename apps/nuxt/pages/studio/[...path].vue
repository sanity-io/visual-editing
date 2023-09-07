<template>
  <ClientOnly>
    <SanityStudio />
  </ClientOnly>
</template>

<script lang="ts" setup>
// These are copied from the definition in next-sanity/studio/metadata
useSeoMeta({
  viewport: 'width=device-width,initial-scale=1,viewport-fit=cover',
  referrer: 'same-origin',
  robots: 'noindex',
})
</script>
