<script lang="ts">
  import type {SanityClient} from '@sanity/client'
  import {onMount} from 'svelte'
  import {useLiveMode} from './createQueryStore'

  export let client: SanityClient

  onMount(() => useLiveMode({client}))
</script>
