import type {ForwardRefExoticComponent, HTMLProps, ReactElement, Ref, SVGProps} from 'react'
import {forwardRef} from 'react'
import {htmlElements} from './html'
import type {SanityElementProps} from './SanityElement'
import {SanityElement} from './SanityElement'
import {svgElements} from './svg'

export type SanityHTMLElements = Record<
  (typeof htmlElements)[number],
  ForwardRefExoticComponent<SanityElementProps & Omit<HTMLProps<HTMLElement>, 'children' | 'ref'>>
>

export type SanitySVGElements = Record<
  (typeof svgElements)[number],
  ForwardRefExoticComponent<SanityElementProps & Omit<SVGProps<SVGElement>, 'children' | 'ref'>>
>

export type SanityElements = SanityHTMLElements & SanitySVGElements

function isHTMLElement(name: string): name is keyof SanityHTMLElements {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return htmlElements.includes(name as any)
}

function isSVGElement(name: string): name is keyof SanitySVGElements {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return svgElements.includes(name as any)
}

const sanity = new Proxy({} as SanityElements, {
  get(target: SanityElements, prop: string) {
    if (isHTMLElement(prop)) {
      if (target[prop]) return target[prop]

      const SanityComponent = forwardRef(function SanityComponent(
        props: SanityElementProps & Omit<HTMLProps<HTMLElement>, 'children' | 'ref'>,
        ref: Ref<HTMLElement>,
      ): ReactElement {
        return <SanityElement {...props} as={prop} ref={ref} />
      })

      SanityComponent.displayName = `sanity.${prop}`

      target[prop] = SanityComponent

      return SanityComponent
    }

    if (isSVGElement(prop)) {
      if (target[prop]) return target[prop]

      const SanityComponent = forwardRef(function SanityComponent(
        props: SanityElementProps & Omit<SVGProps<SVGElement>, 'children' | 'ref'>,
        ref: Ref<SVGElement>,
      ): ReactElement {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <SanityElement {...(props as any)} as={prop} ref={ref} />
      })

      SanityComponent.displayName = `sanity.${prop}`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target[prop] = SanityComponent as any

      return SanityComponent
    }

    throw new Error(`No such element: ${prop}`)
  },
})

export {type htmlElements, sanity, type SanityElementProps, type svgElements}
