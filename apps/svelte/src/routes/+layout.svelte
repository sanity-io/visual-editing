<script lang="ts">
  import '../app.css'
  import { page } from '$app/stores'

  import VisualEditing from '../components/VisualEditing.svelte'
  import { isPreviewing } from '@sanity/svelte-loader'
</script>

<div class="app">
  <slot />

  {#if $isPreviewing}
    <VisualEditing />
    <a
      href={`/draft/disable?redirect=${$page.url.pathname}`}
      class="group fixed bottom-3 right-3 rounded bg-white/30 p-2 text-xs text-gray-800 shadow-lg backdrop-blur-md hover:bg-red-500 hover:text-white"
    >
      <span class="block group-hover:hidden">Preview Enabled</span>
      <span class="hidden group-hover:block">Disable Preview</span>
    </a>
  {/if}
</div>
