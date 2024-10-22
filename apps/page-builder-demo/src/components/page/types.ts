import type {SanityArrayValue, SanityImageValue} from '@/sanity/types'

export interface SectionStyleData {
  variant?: 'default' | 'inverted'
}

export interface HeroSectionData {
  _key: string
  _type: 'hero'
  headline?: string
  tagline?: string
  image?: SanityImageValue
  subline?: string
  style?: SectionStyleData
}

export interface IntroSectionData {
  _key: string
  _type: 'intro'
  headline?: string
  intro?: string
  style?: SectionStyleData
  rotations?: {
    pitch: number
    yaw: number
  }
}

export interface FeaturedProductsSectionData {
  _key: string
  _type: 'featuredProducts'
  headline?: string
  description?: string
  products?: SanityArrayValue<{
    _type: 'product'
    slug?: {current?: string}
    title?: string
    media?: SanityImageValue
  }>[]
  style?: SectionStyleData
}

export interface FeatureHighlightSectionData {
  _key: string
  _type: 'featureHighlight'
  headline?: string
  description?: string
  image?: SanityImageValue
  product?: {
    _type: 'product'
    slug?: {current?: string}
    title?: string
    media?: SanityImageValue
  }
  style?: SectionStyleData
  ctas: Array<{title: string; href: string; _key: string}>
}

export interface PageSectionData {
  _key: string
  _type: 'section'
  headline?: string
  tagline?: string
  subline?: string
}

export interface PageData {
  _type: 'page'
  _id: string
  title?: string
  sections?: Array<PageSection>
}

export type PageSection =
  | HeroSectionData
  | IntroSectionData
  | FeaturedProductsSectionData
  | FeatureHighlightSectionData
  | PageSectionData
