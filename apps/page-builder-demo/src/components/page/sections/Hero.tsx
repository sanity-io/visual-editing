import type {FrontPageQueryResult} from '@/sanity.types'

import {Image} from '@/components/image'
import {dataAttribute} from '@/sanity/dataAttribute'

import {PageSection} from '../PageSection'
import {HeroSectionData} from '../types'

export function Hero(props: {page: NonNullable<FrontPageQueryResult>; section: HeroSectionData}) {
  const {page: data, section} = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      }).toString()}
      className="relative flex items-center justify-center px-4 py-6 sm:px-5 sm:py-7 md:px-7 md:py-9"
      style={{cursor: 'crosshair'}} // Useful for testing overlay cursor overrides
      variant={section.style?.variant}
    >
      <div className="relative z-10 p-5 text-center backdrop-blur-xl">
        {section.headline ? (
          <h1 className="text-3xl font-extrabold sm:text-5xl md:text-6xl">{section.headline}</h1>
        ) : (
          <h1 className="text-3xl font-extrabold text-gray-200 sm:text-5xl md:text-7xl dark:text-gray-800">
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

        {section.tagline ? (
          <p className="text-opacity-700 mt-3 font-serif text-lg sm:mt-4">{section.tagline}</p>
        ) : (
          <p className="mt-3 font-serif text-xl text-gray-200 sm:mt-4 dark:text-gray-800">
            <span
              data-sanity={dataAttribute({
                id: data._id,
                type: data._type,
                path: `sections[_key=="${section._key}"].tagline`,
              }).toString()}
            >
              Tagline
            </span>
          </p>
        )}

        {section.subline ? (
          <p className="text-opacity-700 mt-2 text-sm">{section.subline}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-200 dark:text-gray-800">
            <span
              data-sanity={dataAttribute({
                id: data._id,
                type: data._type,
                path: `sections[_key=="${section._key}"].subline`,
              }).toString()}
            >
              Subline
            </span>
          </p>
        )}
      </div>

      {section.image && (
        <div className="absolute inset-0 h-full w-full">
          <Image
            alt=""
            value={section.image}
            className="h-full w-full object-cover object-center"
            width={2400}
            height={1600}
          />
        </div>
      )}
    </PageSection>
  )
}
