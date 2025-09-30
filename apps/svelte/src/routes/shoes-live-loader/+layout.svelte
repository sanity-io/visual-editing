<script lang="ts">
  import {LiveLoader} from '@sanity/sveltekit'
  import {PUBLIC_SANITY_API_BROWSER_TOKEN as browserToken} from '$env/static/public'
  import {client} from '$lib/sanity'
  import type {LayoutProps} from './$types'

  const {children, data}: LayoutProps = $props()
  const {previewEnabled, previewPerspective} = $derived(data)
</script>

<LiveLoader {client} {previewEnabled} {previewPerspective} {browserToken}>
  {@render children()}
</LiveLoader>
