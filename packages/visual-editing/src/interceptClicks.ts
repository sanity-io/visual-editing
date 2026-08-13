/**
 * Whether a clicked `data-sanity` node should be intercepted to activate its
 * overlay instead of following a link. False while overlays are toggled off.
 */
export let interceptClicks = false

export function setInterceptClicks(nextInterceptClicks: boolean): void {
  interceptClicks = nextInterceptClicks
}
