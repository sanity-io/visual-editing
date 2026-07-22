import type {FrontPageQueryResult} from './sanity.types'

export type PageSection = NonNullable<NonNullable<FrontPageQueryResult>['sections']>[number]

export type HeroSectionData = Extract<PageSection, {_type: 'hero'}>

export type IntroSectionData = Extract<PageSection, {_type: 'intro'}>

export type FeaturedProductsSectionData = Extract<PageSection, {_type: 'featuredProducts'}>

export type FeatureHighlightSectionData = Extract<PageSection, {_type: 'featureHighlight'}>

export type PageSectionData = Extract<PageSection, {_type: 'section'}>

export type {Page as PageData} from './sanity.types'
