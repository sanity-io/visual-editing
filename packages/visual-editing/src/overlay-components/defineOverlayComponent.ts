import type {ComponentProps} from 'react'
import type {OverlayComponent, OverlayComponentProps} from '../types'

export function defineOverlayComponent<T extends OverlayComponent>(
  component: T,
  props?: Omit<ComponentProps<T>, keyof OverlayComponentProps>,
): {component: T; props: Omit<ComponentProps<T>, keyof OverlayComponentProps> | undefined} {
  return {
    component: component,
    props: props,
  }
}
