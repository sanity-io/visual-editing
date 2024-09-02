import {WrappedValue} from '@sanity/react-loader/jsx'
import {sanity} from '@sanity/react-loader/jsx'

import {dataAttribute} from '@/sanity'
import {PageSection} from '../PageSection'
import {HeroSectionData, PageData} from '../types'

export function Hero(props: {
  page: WrappedValue<PageData>
  section: WrappedValue<HeroSectionData>
}) {
  const {page: data, section} = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      })}
      className="px-4 py-6 text-center sm:px-5 sm:py-7 md:px-7 md:py-9"
      variant={section.style?.variant?.value as any}
      data-sanity-draggable
    >
      {section.headline ? (
        <h1 className="text-3xl font-extrabold sm:text-5xl md:text-7xl">
          <sanity.span>{section.headline}</sanity.span>
        </h1>
      ) : (
        <h1 className="text-3xl font-extrabold text-gray-200 sm:text-5xl md:text-7xl dark:text-gray-800">
          <span
            data-sanity={dataAttribute({
              id: data._id,
              type: data._type,
              path: `sections[_key=="${section._key}"].headline`,
            })}
          >
            Headline
          </span>
        </h1>
      )}

      {section.tagline ? (
        <p className="mt-3 font-serif text-xl text-gray-600 sm:mt-4 dark:text-gray-400">
          <sanity.span>{section.tagline}</sanity.span>
        </p>
      ) : (
        <p className="mt-3 font-serif text-xl text-gray-200 sm:mt-4 dark:text-gray-800">
          <span
            data-sanity={dataAttribute({
              id: data._id,
              type: data._type,
              path: `sections[_key=="${section._key}"].tagline`,
            })}
          >
            Tagline
          </span>
        </p>
      )}

      {section.subline ? (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <sanity.span>{section.subline}</sanity.span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-gray-200 dark:text-gray-800">
          <span
            data-sanity={dataAttribute({
              id: data._id,
              type: data._type,
              path: `sections[_key=="${section._key}"].subline`,
            })}
          >
            Subline
          </span>
        </p>
      )}
    </PageSection>
  )
}
