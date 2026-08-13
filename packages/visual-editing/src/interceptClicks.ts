/**
 * Whether clicks on `data-sanity` nodes are handled by overlays. Overlays
 * start out enabled; the toggle event handlers (Alt hold, `mod+\`, the
 * Presentation toolbar) write this synchronously — never during render — so it
 * applies to clicks in the same interaction, before the controller
 * activate/deactivate effect has run.
 */
export let interceptClicks = true

export function setInterceptClicks(nextInterceptClicks: boolean): void {
  interceptClicks = nextInterceptClicks
}
