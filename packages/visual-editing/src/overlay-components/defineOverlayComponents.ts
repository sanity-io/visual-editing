import type {OverlayComponent, OverlayComponentResolver} from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineOverlayComponents<T extends OverlayComponent>(
  resolver: OverlayComponentResolver<T>,
): typeof resolver {
  return resolver
}
