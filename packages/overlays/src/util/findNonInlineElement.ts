export function findNonInlineElement(element: HTMLElement): HTMLElement | null {
  const display = element.computedStyleMap().get('display')?.toString()

  if (display !== 'inline') return element

  const parent = element.parentElement

  if (!parent) return null

  return findNonInlineElement(parent)
}
