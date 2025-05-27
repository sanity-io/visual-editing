<script lang="ts">
  import {PreviewMode, VisualEditing} from '@sanity/sveltekit'
  import '../app.css'
  import {page} from '$app/state'
  import type {LayoutProps} from './$types'

  const {children, data}: LayoutProps = $props()
  const {previewEnabled} = data
</script>

<div class="app">
  {#if previewEnabled}
    <a
      href={`/preview/disable?redirect=${page.url.pathname}`}
      class="group fixed top-0 z-50 block h-8 w-full bg-white/30 p-2 text-center text-xs text-gray-800 shadow-lg backdrop-blur-md hover:bg-red-500 hover:text-white"
    >
      <span class="block group-hover:hidden">Preview Enabled</span>
      <span class="hidden group-hover:block">Disable Preview</span>
    </a>
  {/if}

  <VisualEditing enabled={previewEnabled}>
    <PreviewMode enabled={previewEnabled}>
      {@render children()}
    </PreviewMode>
  </VisualEditing>
</div>
