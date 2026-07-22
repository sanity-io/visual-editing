'use client'

import {
  createContext,
  useContext,
  useMemo,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from 'react'

import {Image as DefaultImage, type ImageProps} from './components/Image'
import type {DataAttributeFn} from './dataAttribute'

export interface LinkProps {
  href: string
  className?: string
  children?: ReactNode
  'data-sanity'?: string
}

function DefaultLink(props: LinkProps) {
  const {href, ...rest} = props
  return <a href={href} {...rest} />
}

export interface PageBuilderContextValue {
  /** App-configured `data-sanity` attribute helper (bound to its studio workspace) */
  dataAttribute: DataAttributeFn
  /** Framework link component, defaults to a plain `<a>` */
  Link: ComponentType<LinkProps>
  /** Image renderer, defaults to a plain `<img>` backed by the shared image URL builder */
  Image: ComponentType<ImageProps>
  /** Optional 3D model rendered by the Intro section (used by the Next.js demo) */
  IntroModel?: ComponentType<{rotations: {pitch: number; yaw: number}}>
}

const PageBuilderContext = createContext<PageBuilderContextValue | null>(null)

export function PageBuilderProvider(props: {
  children: ReactNode
  dataAttribute: DataAttributeFn
  Link?: ComponentType<LinkProps>
  Image?: ComponentType<ImageProps>
  IntroModel?: ComponentType<{rotations: {pitch: number; yaw: number}}>
}): ReactElement {
  const {children, dataAttribute, Link = DefaultLink, Image = DefaultImage, IntroModel} = props

  const value = useMemo(
    () => ({dataAttribute, Link, Image, IntroModel}),
    [dataAttribute, Link, Image, IntroModel],
  )

  return <PageBuilderContext.Provider value={value}>{children}</PageBuilderContext.Provider>
}

export function usePageBuilder(): PageBuilderContextValue {
  const context = useContext(PageBuilderContext)
  if (!context) {
    throw new Error('usePageBuilder must be used within a <PageBuilderProvider>')
  }
  return context
}
