import {WrappedValue} from '@sanity/react-loader/jsx'
import type {SanityDocument} from '@sanity/client'
import {getDraftId, isArray} from 'sanity'

import {dataAttribute} from '@/sanity'
import {FeaturedProducts} from './sections/FeaturedProducts'
import {FeatureHighlight} from './sections/FeatureHighlight'
import {Hero} from './sections/Hero'
import {Intro} from './sections/Intro'
import {Section} from './sections/Section'
import {PageData, PageSection} from './types'
import {useOptimistic} from '@sanity/visual-editing'

export function Page(props: {data: WrappedValue<PageData>}) {
  const {data} = props

  const sections = useOptimistic<WrappedValue<PageSection>[] | undefined, SanityDocument<PageData>>(
    data.sections,
    (state, action) => {
      if (action.id === data._id) {
        return action.document.sections
          ?.map(
            (section: {_key: string} | undefined) => state?.find((s) => s._key === section?._key)!,
          )
          .filter(Boolean)
      }
      return state
    },
  )

  return (
    <main
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: 'sections',
      })}
    >
      {isArray(sections) &&
        sections.map((section) => {
          if (section._type === 'hero') {
            return <Hero page={data} key={section._key} section={section} />
          }

          if (section._type === 'intro') {
            return <Intro page={data} key={section._key} section={section} />
          }

          if (section._type === 'featuredProducts') {
            return <FeaturedProducts page={data} key={section._key} section={section} />
          }

          if (section._type === 'featureHighlight') {
            return <FeatureHighlight page={data} key={section._key} section={section} />
          }

          if (section._type === 'section') {
            return <Section page={data} key={section._key} section={section} />
          }

          return (
            <div
              data-sanity={dataAttribute({
                id: data._id,
                type: data._type,
                path: `sections[_key=="${(section as any)._key}"]`,
              })}
              className="bg-red-50 p-5 font-mono text-sm text-red-600 dark:bg-red-950 dark:text-red-400"
              key={(section as any)._key}
            >
              <div>Unknown section type: {(section as any)._type}</div>
              <pre>{JSON.stringify(section, null, 2)}</pre>
            </div>
          )
        })}
    </main>
  )
}
