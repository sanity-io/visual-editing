<script lang="ts">
  import {getIsPreviewing, QueryLoader} from '@sanity/sveltekit'
  import {client} from '$lib/sanity'

  const {children} = $props()

  const isPreviewing = getIsPreviewing()
</script>

<QueryLoader enabled={isPreviewing} {client}>
  {@render children()}
</QueryLoader>
