export function isMaybePreviewIframe(): boolean {
  return window.self !== window.top
}
export function isMaybePreviewWindow(): boolean {
  return Boolean(window.opener)
}
export function isMaybePresentation(): boolean {
  return isMaybePreviewIframe() || isMaybePreviewWindow()
}
