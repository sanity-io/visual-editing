'use client'

import {dataAttribute} from '@/sanity/dataAttribute'
import type {SanityDocument} from '@sanity/client'
import {useOptimistic} from '@sanity/visual-editing'
import {FeaturedProducts} from './sections/FeaturedProducts'
import {FeatureHighlight} from './sections/FeatureHighlight'
import {Hero} from './sections/Hero'
import {Intro} from './sections/Intro'
import {Section} from './sections/Section'
import {PageData, PageSection} from './types'

export function Page(props: {data: PageData}) {
  const {data} = props

  const sections = useOptimistic<PageSection[] | undefined, SanityDocument<PageData>>(
    data.sections,
    (state, action) => {
      if (action.id === data._id && action.document.sections) {
        return action.document.sections
          .map(
            (section: {_key: string} | undefined) =>
              state?.find((s) => s._key === section?._key) || section,
          )
          .filter(Boolean) as PageSection[]
      }
      return state
    },
  )

  const shouldOverlapHeader = ['featureHighlight', 'hero'].includes(sections?.[0]?._type || '')

  return (
    <main
      className={shouldOverlapHeader ? '-mt-[84px]' : ''}
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: 'sections',
      }).toString()}
    >
      <div className="my-64">
        {data.group_pageSections?.list_pageComponents?.map((component) => {
          const content = component.group_campaignHeroFallbackContent || component.group_accordion
          return content ? (
            <div
              key={component._key}
              data-sanity={dataAttribute({
                id: data._id,
                type: data._type,
                path: `group_pageSections.list_pageComponents[_key=="${(component as any)._key}"]`,
              }).toString()}
            >
              {component._key}
            </div>
          ) : (
            'Nope'
          )
        })}
      </div>
      {sections?.map((section: PageSection | null) => {
        if (section?._type === 'hero') {
          return <Hero page={data} key={section._key} section={section} />
        }

        if (section?._type === 'intro') {
          return <Intro page={data} key={section._key} section={section} />
        }

        if (section?._type === 'featuredProducts') {
          return <FeaturedProducts page={data} key={section._key} section={section} />
        }

        if (section?._type === 'featureHighlight') {
          return <FeatureHighlight page={data} key={section._key} section={section} />
        }

        if (section?._type === 'section') {
          return <Section page={data} key={section._key} section={section} />
        }

        return (
          <div
            data-sanity={
              section
                ? dataAttribute({
                    id: data._id,
                    type: data._type,
                    path: `sections[_key=="${(section as any)._key}"]`,
                  }).toString()
                : undefined
            }
            className="bg-red-50 p-5 font-mono text-sm text-red-600 dark:bg-red-950 dark:text-red-400"
            key={(section as any)?._key}
          >
            <div>Unknown section type: {(section as any)?._type}</div>
            <pre>{JSON.stringify(section, null, 2)}</pre>
          </div>
        )
      })}
    </main>
  )
}
