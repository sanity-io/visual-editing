export function findNonInlineElement(element: HTMLElement): HTMLElement | null {
  const { display } = window.getComputedStyle(element)

  if (display !== 'inline') return element

  const parent = element.parentElement

  if (!parent) return null

  return findNonInlineElement(parent)
}
