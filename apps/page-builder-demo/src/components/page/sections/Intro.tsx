import {dataAttribute} from '@/sanity/dataAttribute'
import {PageSection} from '../PageSection'
import {IntroSectionData, PageData} from '../types'

export function Intro(props: {page: PageData; section: IntroSectionData}) {
  const {page: data, section} = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      }).toString()}
      className="p-4 sm:p-5 md:p-6"
      variant={section.style?.variant}
    >
      {section.headline ? (
        <h1 className="text-2xl font-extrabold sm:text-3xl md:text-4xl">{section.headline}</h1>
      ) : (
        <h1 className="text-2xl font-extrabold text-gray-200 sm:text-3xl md:text-4xl dark:text-gray-800">
          <span
            data-sanity={dataAttribute({
              id: data._id,
              type: data._type,
              path: `sections[_key=="${section._key}"].headline`,
            }).toString()}
          >
            Headline
          </span>
        </h1>
      )}

      {section.intro ? (
        <p className="mt-3 font-serif text-xl text-gray-600 sm:mt-4 dark:text-gray-400">
          {section.intro}
        </p>
      ) : (
        <p className="mt-3 font-serif text-xl text-gray-200 sm:mt-4 dark:text-gray-800">
          <span
            data-sanity={dataAttribute({
              id: data._id,
              type: data._type,
              path: `sections[_key=="${section._key}"].intro`,
            }).toString()}
          >
            Intro
          </span>
        </p>
      )}
    </PageSection>
  )
}
