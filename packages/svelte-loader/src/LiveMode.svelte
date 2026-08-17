<script lang="ts">
  import type {SanityClientLike} from '@sanity/core-loader'
  import {onMount} from 'svelte'
  import {useLiveMode} from './createQueryStore'

  export let client: SanityClientLike

  onMount(() => useLiveMode({client}))
</script>
