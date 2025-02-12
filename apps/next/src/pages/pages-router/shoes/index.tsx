import {shoesList} from '@/queries'
import type {ShoesListResult} from '@/types'
import {formatCurrency} from '@/utils'
import type {ClientPerspective, ContentSourceMap} from '@sanity/client'
import {useQuery} from '@sanity/react-loader'
import {GetStaticProps, InferGetStaticPropsType} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type {SharedProps} from '../../_app'
import {loadQuery} from '../../../components/sanity.ssr'
import {urlFor, urlForCrossDatasetReference} from '../../../components/utils'

interface Props extends SharedProps {
  initial: {data: ShoesListResult; sourceMap?: ContentSourceMap}
}

export const getStaticProps = (async (context) => {
  const {draftMode = false} = context
  const perspective = (draftMode ? 'drafts' : 'published') satisfies ClientPerspective
  const initial = await loadQuery<ShoesListResult>(shoesList, {}, {perspective})
  return {props: {draftMode, initial}, revalidate: 1}
}) satisfies GetStaticProps<Props>

export default function ShoesPage(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const {initial} = props
  const {
    data: products,
    error,
    loading,
    encodeDataAttribute,
  } = useQuery<ShoesListResult>(shoesList, {}, {initial})

  if (error) {
    throw error
  }

  return (
    <div className="min-h-screen bg-white">
      <nav aria-label="Breadcrumb" className="pt-16 sm:pt-24">
        <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <li>
            <div className="flex items-center">
              <Link
                href="/pages-router/shoes"
                aria-current="page"
                className="mr-2 text-sm font-medium text-gray-900"
              >
                Shoes
              </Link>
            </div>
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h1 className="sr-only">Products</h1>

        {loading ? (
          <div className="animate-pulse">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products?.map?.((product, i) => (
              <Link
                key={product.slug?.current}
                href={`/pages-router/shoes/${product.slug?.current}`}
                className="group relative"
              >
                <div
                  data-sanity={encodeDataAttribute([i, 'media', 'asset'])}
                  className="aspect-h-1 aspect-w-1 xl:aspect-h-8 xl:aspect-w-7 w-full overflow-hidden rounded-lg bg-gray-200"
                >
                  <Image
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                    src={
                      product.media?.asset
                        ? urlFor(product.media).width(1440).height(1440).url()
                        : `https://source.unsplash.com/featured/720x720?shoes&r=${i}`
                    }
                    width={720}
                    height={720}
                    alt={product.media?.alt || ''}
                  />
                </div>
                <h2
                  className="mb-8 mt-4 text-sm text-gray-700"
                  style={{['textWrap' as any]: 'balance'}}
                >
                  {product.title}
                </h2>
                <p
                  data-sanity={encodeDataAttribute([i, 'price'])}
                  className="absolute bottom-0 left-0 mt-1 text-lg font-medium text-gray-900"
                >
                  {product.price ? formatCurrency(product.price) : 'FREE'}
                </p>
                {product.brand && (
                  <div className="absolute bottom-0.5 right-0 flex items-center gap-x-2">
                    <Image
                      className="h-6 w-6 rounded-full bg-gray-50"
                      src={
                        // @ts-expect-error - cross dataset reference typegen not working yet
                        product.brand?.logo?.asset
                          ? // @ts-expect-error - cross dataset reference typegen not working yet
                            urlForCrossDatasetReference(product.brand.logo)
                              .width(48)
                              .height(48)
                              .url()
                          : `https://source.unsplash.com/featured/48x48?${
                              // @ts-expect-error - cross dataset reference typegen not working yet
                              product.brand.name
                                ? // @ts-expect-error - cross dataset reference typegen not working yet
                                  encodeURIComponent(product.brand.name)
                                : `brand&r=${i}`
                            }`
                      }
                      width={24}
                      height={24}
                      // @ts-expect-error - cross dataset reference typegen not working yet
                      alt={product.brand?.logo?.alt || ''}
                    />
                    <span className="font-bold text-gray-600">
                      {
                        // @ts-expect-error - cross dataset reference typegen not working yet
                        product.brand.name
                      }
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
