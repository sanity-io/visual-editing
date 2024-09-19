/**
 * The Sanity Client perspective used when fetching data
 * @public
 */
export type DraftPerspective = 'checking' | 'previewDrafts' | 'published' | 'unknown'

/**
 *
 * @public
 */
export type DraftEnvironment =
  | 'checking'
  | 'presentation-iframe'
  | 'presentation-window'
  | 'live'
  | 'unknown'

/**
 * Reports the current draft mode environment.
 * Use it to determine how to adapt the UI based on wether:
 * - Your app is previewed in a iframe, inside Presentation Tool in a Sanity Studio.
 * - Your app is previewed in a new window, spawned from Presentation Tool in a Sanity Studio.
 * - Your app is live previewing drafts in a standalone context.
 * - Your app is previewing drafts, but not live.
 * - Your app is not previewing anything (that could be detected).
 * @public
 */
export function useDraftMode(): [DraftPerspective, DraftEnvironment] {
  return ['checking', 'checking']
}
