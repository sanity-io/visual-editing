import type {OverlayComponent, OverlayComponentResolver} from '../types'

export function defineOverlayComponents<T extends OverlayComponent>(
  resolver: OverlayComponentResolver<T>,
): typeof resolver {
  return resolver
}
