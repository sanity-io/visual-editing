import { WrappedValue, unwrapData } from '@sanity/csm'
import { sanity } from '@sanity/react-loader/jsx'
import Link from 'next/link'

import { Image } from '@/components/image'
import { dataAttribute } from '@/sanity'
import { PageSection } from '../PageSection'
import { FeatureHighlightSectionData, PageData } from '../types'

export function FeatureHighlight(props: {
  page: WrappedValue<PageData>
  section: WrappedValue<FeatureHighlightSectionData>
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
      <div className="-m-4 sm:-m-5 md:-m-6">
        {section.image?.asset && (
          <Image
            alt=""
            className="aspect[2/1] w-full"
            value={section.image}
            width={1200}
            height={600}
          />
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-xl bg-white p-4 dark:bg-black sm:p-5">
        <h1 className="text-2xl font-extrabold sm:text-3xl md:text-4xl">
          <sanity.span>{section.headline}</sanity.span>
        </h1>
        {section.description && (
          <p className="mt-3 font-serif text-xl dark:text-gray-400 sm:mt-4">
            <sanity.span>{section.description}</sanity.span>
          </p>
        )}
      </div>

      {section.product && (
        <Link
          className="block w-96 flex-none border border-white p-5 hover:border-gray-100 dark:border-black dark:hover:border-gray-800"
          href={`/product/${section.product.slug?.current?.value}`}
        >
          <h2>
            <sanity.span>{section.product.title}</sanity.span>
          </h2>
          <div>
            {section.product.media?.asset && (
              <Image alt="" value={unwrapData(section.product.media)} />
            )}
          </div>
        </Link>
      )}
    </PageSection>
  )
}
