import { WrappedValue } from '@sanity/csm'
import { sanity } from '@sanity/react-loader/jsx'

import { dataAttribute } from '@/sanity'
import { PageSection } from '../PageSection'
import { IntroSectionData, PageData } from '../types'

export function Intro(props: {
  page: WrappedValue<PageData>
  section: WrappedValue<IntroSectionData>
}) {
  const { page: data, section } = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      })}
      className="p-4 sm:p-5 md:p-6"
      variant={section.style?.variant?.value as any}
    >
      {section.headline ? (
        <h1 className="text-2xl font-extrabold sm:text-3xl md:text-4xl">
          <sanity.span>{section.headline}</sanity.span>
        </h1>
      ) : (
        <h1 className="text-2xl font-extrabold text-gray-200 dark:text-gray-800 sm:text-3xl md:text-4xl">
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

      {section.intro ? (
        <p className="mt-3 font-serif text-xl text-gray-600 dark:text-gray-400 sm:mt-4">
          <sanity.span>{section.intro}</sanity.span>
        </p>
      ) : (
        <p className="mt-3 font-serif text-xl text-gray-200 dark:text-gray-800 sm:mt-4">
          <span
            data-sanity={dataAttribute({
              id: data._id,
              type: data._type,
              path: `sections[_key=="${section._key}"].intro`,
            })}
          >
            Intro
          </span>
        </p>
      )}
    </PageSection>
  )
}
