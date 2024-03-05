<script lang="ts">
  import { onMount } from 'svelte'
  import { useLiveMode } from '@sanity/svelte-loader'
  import { client } from '$lib/sanity'

  onMount(() => useLiveMode({ client }))
</script>

<slot />
