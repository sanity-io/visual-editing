import type {FrontPageQueryResult} from '@/sanity.types'
import {dataAttribute} from '@/sanity/dataAttribute'
import {PageSection} from '../PageSection'
import {PageSectionData} from '../types'

export function Section(props: {
  page: NonNullable<FrontPageQueryResult>
  section: PageSectionData
}) {
  const {page, section} = props

  return (
    <PageSection
      className="px-4 py-6 text-center sm:px-5 sm:py-7 md:px-7 md:py-8"
      data-sanity={dataAttribute({
        id: page._id,
        type: page._type,
        path: `sections[_key=="${section._key}"]`,
      }).toString()}
    >
      {section.headline ? (
        <h1 className="text-3xl font-extrabold outline-none sm:text-5xl md:text-7xl">
          {section.headline}
        </h1>
      ) : (
        <h1 className="text-3xl font-extrabold text-gray-200 sm:text-5xl md:text-7xl dark:text-gray-800">
          <span
            data-sanity={dataAttribute({
              id: page._id,
              type: page._type,
              path: `sections[_key=="${section._key}"].headline`,
            }).toString()}
          >
            Headline
          </span>
        </h1>
      )}

      {section.tagline ? (
        <p className="mt-3 font-serif text-xl text-gray-600 sm:mt-4 dark:text-gray-400">
          {section.tagline}
        </p>
      ) : (
        <p className="mt-3 font-serif text-xl text-gray-200 sm:mt-4 dark:text-gray-800">
          <span
            data-sanity={dataAttribute({
              id: page._id,
              type: page._type,
              path: `sections[_key=="${section._key}"].tagline`,
            }).toString()}
          >
            Tagline
          </span>
        </p>
      )}

      {section.subline ? (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{section.subline}</p>
      ) : (
        <p className="mt-2 text-sm text-gray-200 dark:text-gray-800">
          <span
            data-sanity={dataAttribute({
              id: page._id,
              type: page._type,
              path: `sections[_key=="${section._key}"].subline`,
            }).toString()}
          >
            Subline
          </span>
        </p>
      )}
    </PageSection>
  )
}
