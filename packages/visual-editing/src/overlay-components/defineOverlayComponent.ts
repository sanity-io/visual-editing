import type {ComponentProps} from 'react'
import type {OverlayComponent, OverlayComponentProps} from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineOverlayComponent<T extends OverlayComponent<Record<string, unknown>, any>>(
  component: T,
  props?: Omit<ComponentProps<T>, keyof OverlayComponentProps>,
): {component: T; props: typeof props} {
  return {
    component: component,
    props: props,
  }
}
