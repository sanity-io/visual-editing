<script lang="ts">
  import '../app.css'
  import { onMount } from 'svelte'
  import { enableOverlays } from '@sanity/overlays'
  import { useLiveMode } from '@sanity/svelte-loader'
  import { client } from '$lib/sanity'

  onMount(() => enableOverlays())

  onMount(() => useLiveMode({ client }))
</script>

<div class="app">
  <slot />
</div>
