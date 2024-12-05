import {Image} from '@/components/image'
import type {FrontPageQueryResult} from '@/sanity.types'
import {dataAttribute} from '@/sanity/dataAttribute'
import type {SanityDocument} from '@sanity/client'
import {useOptimistic} from '@sanity/visual-editing'
import Link from 'next/link'
import {PageSection} from '../PageSection'
import {FeaturedProductsSectionData, PageData} from '../types'

function FeaturedProductsList(props: {
  id: string
  type: string
  sectionKey: string
  products: FeaturedProductsSectionData['products']
}) {
  const {products: _products, id, type, sectionKey} = props

  const products = useOptimistic<
    FeaturedProductsSectionData['products'] | undefined,
    SanityDocument<PageData>
  >(_products, (state, action) => {
    console.log(action)
    if (action.id === id && action.document.sections) {
      const section = action.document.sections.find((section) => section._key === sectionKey)
      if (section && section._type === 'featuredProducts') {
        return section.products
          ?.map(
            (section: {_key: string} | undefined) => state?.find((s) => s._key === section?._key)!,
          )
          .filter(Boolean)
      }
    }
    return state
  })
  return (
    <div className="flex flex-nowrap gap-4 md:gap-6">
      {products?.map?.((product) => (
        <Link
          data-sanity={dataAttribute({
            id,
            type,
            path: `sections[_key=="${sectionKey}"].products[_key=="${product._key}"]`,
          }).toString()}
          className="group block w-64 flex-none"
          href={`/product/${product.slug?.current}`}
          key={product._key}
        >
          {product.media?.asset && (
            <div className="mb-2 overflow-hidden">
              <Image
                alt=""
                value={product.media}
                className="transition-transform duration-500 group-hover:scale-125"
              />
            </div>
          )}
          <h2 className="font-bold">{product.title}</h2>
        </Link>
      ))}
    </div>
  )
}

export function FeaturedProducts(props: {
  page: NonNullable<FrontPageQueryResult>
  section: FeaturedProductsSectionData
}) {
  const {page: data, section} = props

  return (
    <PageSection
      data-sanity={dataAttribute({
        id: data._id,
        type: data._type,
        path: `sections[_key=="${section._key}"]`,
      }).toString()}
      variant={section.style?.variant}
    >
      <div className="flex w-full flex-col gap-4 p-4 pb-7 sm:px-5 md:flex-row md:px-6 md:pb-8">
        <div className="w-full flex-shrink-0 md:max-w-44">
          <div className="sticky top-4 border-t border-current pt-2">
            <h1 className="text-sm font-bold">{section.headline}</h1>
          </div>
        </div>

        <div className="w-full min-w-0 flex-grow border-current md:border-t md:pt-2">
          {section.description && <p className="mb-6 max-w-96 text-sm">{section.description}</p>}
          <div className="w-full overflow-x-auto">
            <FeaturedProductsList
              id={data._id}
              type={data._type}
              sectionKey={section._key}
              products={section.products}
            />
          </div>
        </div>
      </div>
    </PageSection>
  )
}
