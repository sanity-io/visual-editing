<script lang="ts">
  import {useLiveMode} from '@sanity/svelte-loader'
  import {client} from '$lib/sanity'
  import {onMount} from 'svelte'

  onMount(() => useLiveMode({client}))
</script>

<slot />
