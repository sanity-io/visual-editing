<script lang="ts">
  import { onMount } from 'svelte'
  import { enableOverlays, type HistoryAdapterNavigate } from '@sanity/overlays'
  import { useLiveMode } from '@sanity/svelte-loader'
  import { afterNavigate, goto } from '$app/navigation'
  import { client } from '$lib/sanity'

  onMount(() => useLiveMode({ client }))

  let navigate: HistoryAdapterNavigate | undefined
  let navigatingFromUpdate = false

  onMount(() =>
    enableOverlays({
      history: {
        subscribe: (_navigate) => {
          navigate = _navigate
          // Initial navigation
          navigate({
            type: 'replace',
            url: window.location.pathname + window.location.search,
          })
          return () => {
            navigate = undefined
          }
        },
        update: (update) => {
          if (update.type === 'push' || update.type === 'replace') {
            navigatingFromUpdate = true
            goto(update.url, { replaceState: update.type === 'replace' })
          } else if (update.type === 'pop') {
            history.back()
          }
        },
      },
    }),
  )

  afterNavigate(async ({ to, complete }) => {
    if (navigate && to && !navigatingFromUpdate) {
      await complete
      navigate({ type: 'push', url: to.url.pathname + to.url.search })
    }
    navigatingFromUpdate = false
  })
</script>
