'use client'

import type {SanityDocument} from '@sanity/client'
import {useOptimistic} from '@sanity/visual-editing/react'
import type {ReactElement} from 'react'

import {usePageBuilder} from '../context'
import type {FrontPageQueryResult} from '../sanity.types'
import type {PageData, PageSection} from '../types'
import {FeaturedProducts} from './sections/FeaturedProducts'
import {FeatureHighlight} from './sections/FeatureHighlight'
import {Hero} from './sections/Hero'
import {Intro} from './sections/Intro'
import {Section} from './sections/Section'

export function Page(props: {data: FrontPageQueryResult; loading?: boolean}): ReactElement {
  const {data, loading} = props
  const {dataAttribute} = usePageBuilder()

  const sections = useOptimistic<PageSection[] | null | undefined, SanityDocument<PageData>>(
    data?.sections,
    (state, action) => {
      if (action.id === data?._id && action.document.sections) {
        return action.document.sections
          .map((section) => state?.find((s) => s._key === section?._key) || section)
          .filter(Boolean) as PageSection[]
      }
      return state
    },
  )

  const shouldOverlapHeader = ['featureHighlight', 'hero'].includes(sections?.[0]?._type || '')

  return (
    <main
      className={shouldOverlapHeader ? '-mt-[84px]' : ''}
      data-sanity={
        data
          ? dataAttribute({
              id: data._id,
              type: data._type,
              path: 'sections',
            }).toString()
          : undefined
      }
    >
      {!data && !loading && (
        <div className="bg-red-50 p-5 font-mono text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          <div>404 Page not found</div>
        </div>
      )}
      {data &&
        sections?.map((section: PageSection | null) => {
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
                data && section
                  ? dataAttribute({
                      id: data._id,
                      type: data._type,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      path: `sections[_key=="${(section as any)._key}"]`,
                    }).toString()
                  : undefined
              }
              className="bg-red-50 p-5 font-mono text-sm text-red-600 dark:bg-red-950 dark:text-red-400"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              key={(section as any)?._key}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <div>Unknown section type: {(section as any)?._type}</div>
              <pre>{JSON.stringify(section, null, 2)}</pre>
            </div>
          )
        })}
    </main>
  )
}
