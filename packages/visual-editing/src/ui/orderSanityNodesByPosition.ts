import type {ElementState, SanityNode} from '../types'

/**
 * Orders elements by visual position (top-to-bottom, left-to-right), maps each
 * to its SanityNode, and de-duplicates by id — keeping the first (topmost)
 * occurrence.
 *
 * @internal
 */
export function orderSanityNodesByPosition(elements: ElementState[]): SanityNode[] {
  const sorted = [...elements].sort((elementA, elementB) => {
    const yDiff = elementA.rect.y - elementB.rect.y
    return yDiff !== 0 ? yDiff : elementA.rect.x - elementB.rect.x
  })

  const seen = new Set<string>()
  return sorted.reduce<SanityNode[]>((acc, element) => {
    const {sanity} = element
    if (!sanity || !('id' in sanity)) return acc
    if (seen.has(sanity.id)) return acc
    seen.add(sanity.id)
    acc.push(sanity)
    return acc
  }, [])
}
