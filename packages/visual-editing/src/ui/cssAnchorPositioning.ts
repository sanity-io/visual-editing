/**
 * Feature-detection query for CSS anchor positioning plus overflow fallbacks.
 *
 * Overlay chrome (title labels, "Open in Studio", HUD) uses this as progressive
 * enhancement: browsers that match keep labels on-screen while the preview
 * iframe scrolls, without the IntersectionObserver flip heuristic.
 *
 * Both conditions are required. `anchor-name` alone would tether labels but
 * would not flip them away from the viewport edge.
 */
export const CSS_ANCHOR_POSITIONING_SUPPORTS =
  '(anchor-name: --sanity-ve-overlay) and (position-try-fallbacks: flip-block)'

/** @internal */
export function supportsCssAnchorPositioning(
  supportsFn: ((conditionText: string) => boolean) | undefined = globalThis.CSS?.supports?.bind(
    globalThis.CSS,
  ),
): boolean {
  return supportsFn?.(CSS_ANCHOR_POSITIONING_SUPPORTS) === true
}
