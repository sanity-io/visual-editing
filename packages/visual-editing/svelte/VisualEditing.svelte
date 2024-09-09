<script lang="ts">
  import {afterNavigate, goto, invalidateAll} from '$app/navigation'
  import {onMount} from 'svelte'
  import {enableVisualEditing, type HistoryAdapterNavigate} from '../dist/index.js'
  import type {VisualEditingProps} from './types'

  export let zIndex: VisualEditingProps['zIndex'] = undefined
  /**
   * The refresh API allows smarter refresh logic than the default `location.reload()` behavior.
   * You can call the refreshDefault argument to trigger the default refresh behavior so you don't have to reimplement it.
   */
  export let refresh: VisualEditingProps['refresh'] = undefined

  let navigate: HistoryAdapterNavigate | undefined
  let navigatingFromUpdate = false

  onMount(() =>
    enableVisualEditing({
      zIndex,
      refresh: (payload) => {
        function refreshDefault() {
          if (payload.source === 'mutation' && payload.livePreviewEnabled) {
            return false
          }
          return new Promise<void>(async (resolve) => {
            await invalidateAll()
            resolve()
          })
        }
        return refresh ? refresh(payload, refreshDefault) : refreshDefault()
      },
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
            goto(update.url, {replaceState: update.type === 'replace'})
          } else if (update.type === 'pop') {
            history.back()
          }
        },
      },
    }),
  )

  afterNavigate(async ({to, complete}) => {
    if (navigate && to && !navigatingFromUpdate) {
      await complete
      navigate({type: 'push', url: to.url.pathname + to.url.search})
    }
    navigatingFromUpdate = false
  })
</script>
