<script lang="ts">
  import {enableVisualEditing, type HistoryAdapterNavigate} from '@sanity/visual-editing'
  import {afterNavigate, goto, invalidateAll} from '$app/navigation'
  import {onMount} from 'svelte'
  import type {VisualEditingProps} from './types'

  export let zIndex: VisualEditingProps['zIndex'] = undefined
  /**
   * The refresh API allows smarter refresh logic than the default `location.reload()` behavior.
   * You can call the refreshDefault argument to trigger the default refresh behavior so you don't have to reimplement it.
   */
  export let refresh: VisualEditingProps['refresh'] = undefined
  /**
   * While Visual Editing is enabled, stega-encoded metadata (invisible characters) is
   * automatically stripped from clipboard data when content is copied from the page.
   * Set this prop to `true` to opt out and keep stega in copied content.
   */
  export let keepStegaOnCopy: VisualEditingProps['keepStegaOnCopy'] = undefined
  /**
   * Reports stega payloads found in places where they always cause bugs or bloat, such as
   * `class`, `href`, `src` and other attributes, inside `<head>`, `<script>` or `<style>`
   * contents, form values, or the page URL. Providing the callback opts in to the detection
   * logic — when it isn't provided no scanning runs.
   */
  export let onSuspiciousStega: VisualEditingProps['onSuspiciousStega'] = undefined

  let navigate: HistoryAdapterNavigate | undefined
  let navigatingFromUpdate = false

  onMount(() =>
    enableVisualEditing({
      zIndex,
      keepStegaOnCopy,
      onSuspiciousStega: onSuspiciousStega
        ? (reports) => onSuspiciousStega?.(reports)
        : undefined,
      refresh: (payload) => {
        function refreshDefault() {
          // @TODO handle
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
