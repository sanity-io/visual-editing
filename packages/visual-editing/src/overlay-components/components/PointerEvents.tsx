import type {FunctionComponent, HTMLAttributes, PropsWithChildren} from 'react'

export const PointerEvents: FunctionComponent<
  PropsWithChildren<HTMLAttributes<HTMLDivElement>>
> = ({children, style, ...rest}) => {
  return (
    <div style={{...style, pointerEvents: 'all'}} data-sanity-overlay-element {...rest}>
      {children}
    </div>
  )
}
