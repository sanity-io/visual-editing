import { WrappedValue, unwrapData } from '@sanity/react-loader/jsx'
import { sanity } from '@sanity/react-loader/jsx'
import Link from 'next/link'

import { Image } from '@/components/image'
import { PageSection } from '../PageSection'
import { FeaturedProductsSectionData, PageData } from '../types'
import { dataAttribute } from '@/sanity'

export function FeaturedProducts(props: {
  page: WrappedValue<PageData>
  section: WrappedValue<FeaturedProductsSectionData>
}) {
  const { page: data, section } = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      })}
      className="overflow-hidden"
      variant={section.style?.variant?.value as any}
    >
      <div className="flex w-full flex-nowrap gap-2 overflow-auto p-4 sm:p-5 md:p-6">
        <h1 className="w-96 flex-none p-5 text-2xl font-bold">
          <sanity.span>{section.headline}</sanity.span>
        </h1>

        {section.products?.map?.((product) => (
          <Link
            className="block w-96 flex-none border border-white p-5 hover:border-gray-100 dark:border-black dark:hover:border-gray-800"
            href={`/product/${product.slug?.current?.value}`}
            key={product._key}
          >
            <h2>
              <sanity.span>{product.title}</sanity.span>
            </h2>
            <div>
              {product.media?.asset && (
                <Image alt="" value={unwrapData(product.media)} />
              )}
            </div>
          </Link>
        ))}
      </div>
    </PageSection>
  )
}
