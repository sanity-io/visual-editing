import {stegaClean} from 'next-sanity'
import Link from 'next/link'

import type {FrontPageQueryResult} from '@/sanity.types'

import {Image} from '@/components/image'
import {dataAttribute} from '@/sanity/dataAttribute'

import {PageSection} from '../PageSection'
import {FeatureHighlightSectionData, PageData} from '../types'

export function FeatureHighlight(props: {
  page: NonNullable<FrontPageQueryResult>
  section: FeatureHighlightSectionData
}) {
  const {page: data, section} = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      }).toString()}
      className=""
      variant={section.style?.variant}
    >
      <div className="relative w-full overflow-hidden">
        <div className="">
          {section.image?.asset && (
            <Image alt="" className="w-full" value={section.image} width={2400} height={1600} />
          )}
        </div>

        <div className="inset-0 z-10 flex items-end p-4 sm:p-5 md:absolute md:flex-row md:p-6 md:pb-8">
          <div className="flex flex-col gap-4 bg-opacity-80 backdrop-blur-lg md:max-w-md md:p-5 md:text-white">
            <h1 className="text-2xl font-bold">{section.headline}</h1>
            {section.description && <p className="font-serif text-base">{section.description}</p>}
            <div className="flex gap-2">
              {section.ctas &&
                section.ctas.map((cta, i) => (
                  <button
                    data-sanity={dataAttribute({
                      id: data._id,
                      type: data._type,
                      path: `sections[_key=="${section._key}"].ctas[_key=="${cta._key}"]`,
                    }).toString()}
                    className="border px-3 py-2 text-sm text-current md:border-none md:bg-black md:bg-opacity-30 dark:border-gray-600"
                    key={cta._key}
                  >
                    {stegaClean(cta.title)}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {section.product && (
          <Link
            className="block w-96 flex-none border border-white p-5 hover:border-gray-100 dark:border-black dark:hover:border-gray-800"
            href={`/product/${section.product.slug?.current}`}
          >
            <h2>{section.product.title}</h2>
            <div>
              {section.product.media?.asset && <Image alt="" value={section.product.media} />}
            </div>
          </Link>
        )}
      </div>
    </PageSection>
  )
}
