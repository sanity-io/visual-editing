/**
 * True when the click should be left to the page (new tab, download, etc.)
 * rather than activating an overlay.
 */
export function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}
