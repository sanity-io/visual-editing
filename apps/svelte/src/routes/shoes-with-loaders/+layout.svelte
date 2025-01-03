<script lang="ts">
  import {LiveMode} from '@sanity/svelte-loader'
  import {isPreviewing, VisualEditing} from '@sanity/visual-editing/svelte'
  import {page} from '$app/stores'
  import {client} from '$lib/sanity'
</script>

{#if $isPreviewing}
  <a
    href={`/preview/disable?redirect=${$page.url.pathname}`}
    class="group sticky top-0 z-50 block h-8 w-full bg-white/30 p-2 text-center text-xs text-gray-800 shadow-lg backdrop-blur-md hover:bg-red-500 hover:text-white"
  >
    <span class="block group-hover:hidden">Preview Enabled (Shoes with Loaders)</span>
    <span class="hidden group-hover:block">Disable Preview</span>
  </a>
{/if}

<slot />

{#if $isPreviewing}
  <VisualEditing />
  <LiveMode {client} />
{/if}
