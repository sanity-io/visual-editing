import {Image} from '@/components/image'
import {dataAttribute} from '@/sanity/dataAttribute'
import Link from 'next/link'
import {PageSection} from '../PageSection'
import {FeaturedProductsSectionData, PageData} from '../types'

export function FeaturedProducts(props: {page: PageData; section: FeaturedProductsSectionData}) {
  const {page: data, section} = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      }).toString()}
      className="overflow-hidden"
      variant={section.style?.variant}
    >
      <div className="flex w-full flex-nowrap gap-2 overflow-auto p-4 sm:p-5 md:p-6">
        <h1 className="w-96 flex-none p-5 text-2xl font-bold">{section.headline}</h1>

        <div>
          {section.products?.map?.((product) => (
            <Link
              className="block w-96 flex-none border border-white p-5 hover:border-gray-100 dark:border-black dark:hover:border-gray-800"
              href={`/product/${product.slug?.current}`}
              key={product._key}
            >
              <h2>{product.title}</h2>
              <div>{product.media?.asset && <Image alt="" value={product.media} />}</div>
            </Link>
          ))}
        </div>
      </div>
    </PageSection>
  )
}
