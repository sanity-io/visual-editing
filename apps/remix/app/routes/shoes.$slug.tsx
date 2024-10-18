import {PortableText} from '@portabletext/react'
import {Link, useLoaderData} from '@remix-run/react'
import {stegaClean} from '@sanity/client/stega'
import {useQuery} from '@sanity/react-loader'
import {createDataAttribute} from '@sanity/visual-editing'
import {json, type LoaderFunction} from '@vercel/remix'
import {shoe, shoesList, type ShoeParams, type ShoeResult, type ShoesListResult} from '~/queries'
import {urlFor, urlForCrossDatasetReference} from '~/sanity'
import {loadQuery} from '~/sanity.loader.server'
import {formatCurrency} from '~/utils'

export const loader: LoaderFunction = async ({params}) => {
  return json({
    params,
    initial: {
      shoe: await loadQuery<ShoeResult>(shoe, params),
      shoes: await loadQuery<ShoesListResult>(`${shoesList}[0..3]`),
    },
  })
}

export default function ShoePage() {
  const {params, initial} = useLoaderData<typeof loader>()

  if (!params.slug) {
    throw new Error('No slug, 404?')
  }

  const shoeSnapshot = useQuery<ShoeResult>(shoe, params satisfies ShoeParams, {
    initial: initial.shoe,
  })
  const shoesSnapshot = useQuery<ShoesListResult>(
    `${shoesList}[0..3]`,
    {},
    {initial: initial.shoes},
  )

  if (shoeSnapshot.error || shoesSnapshot.error) {
    throw shoeSnapshot.error || shoesSnapshot.error
  }

  const {data: product} = shoeSnapshot
  const [coverImage, ...otherImages] = product?.media || []

  const {data: products} = shoesSnapshot

  // Only consider it loading if there are no data
  const loadingShoe = shoeSnapshot.loading && !shoeSnapshot.data
  const loadingShoes = shoesSnapshot.loading && !shoesSnapshot.data?.length

  return (
    <div className="min-h-screen bg-white">
      <nav aria-label="Breadcrumb" className="pt-16 sm:pt-24">
        <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <li>
            <div className="flex items-center">
              <Link to="/shoes" className="mr-2 text-sm font-medium text-gray-900">
                Shoes
              </Link>
              <svg
                width={16}
                height={20}
                viewBox="0 0 16 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-5 w-4 text-gray-300"
              >
                <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
              </svg>
            </div>
          </li>
          <li className="text-sm" style={{['textWrap' as any]: 'balance'}}>
            <Link
              to={`/shoes/${params.slug}`}
              aria-current="page"
              className="font-medium text-gray-500 hover:text-gray-600"
            >
              {loadingShoe ? 'Loading' : product?.title || 'Untitled'}
            </Link>
          </li>
        </ol>
      </nav>

      {product && (
        <article>
          {coverImage?.asset && (
            <div className="mx-auto max-w-2xl px-4 pt-16 sm:px-6 lg:max-w-7xl lg:px-8 lg:pt-24">
              <img
                className="aspect-video w-full rounded-md object-cover object-center group-hover:opacity-75 lg:rounded-lg"
                src={urlFor(coverImage)
                  .width(1280 * 2)
                  .height(720 * 2)
                  .url()}
                width={1280}
                height={720}
                alt={coverImage.alt || ''}
              />
            </div>
          )}
          {otherImages?.length > 0 && (
            <div className="mx-auto max-w-2xl px-4 pt-5 sm:px-6 lg:max-w-7xl lg:px-8 lg:pt-8">
              <div className="relative flex w-full snap-x snap-mandatory gap-6 overflow-x-auto">
                {otherImages.map((image, _i) => {
                  if (!image.asset?._ref) return null
                  // The index is wrong due to slicing out `coverImage`
                  const i = _i + 1

                  return (
                    <div
                      data-sanity={createDataAttribute({
                        id: product._id,
                        type: 'shoe',
                        path: `media[_key=="${image._key}"]`,
                      }).toString()}
                      key={(image.asset._ref as string) || i}
                      className="shrink-0 snap-start"
                    >
                      <img
                        className="h-32 w-40 shrink-0 rounded bg-white shadow-xl lg:rounded-lg"
                        src={urlFor(image)
                          .width(1280 / 2)
                          .height(720 / 2)
                          .url()}
                        width={1280 / 2}
                        height={720 / 2}
                        alt={stegaClean(image.alt) || ''}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Product info */}
          <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
              <h1
                className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                style={{['textWrap' as any]: 'balance'}}
              >
                {product.title}
              </h1>
            </div>

            {/* Options */}
            <div className="mt-4 flex flex-col gap-y-6 lg:row-span-3 lg:mt-0">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                {product.price ? formatCurrency(product.price) : 'FREE'}
              </p>

              {product.brand?.name && (
                <div>
                  <h2 className="text-sm font-medium text-gray-900">Brand</h2>
                  <div className="flex items-center gap-x-2">
                    <img
                      className="h-10 w-10 rounded-full bg-gray-50"
                      src={
                        product.brand?.logo?.asset
                          ? urlForCrossDatasetReference(product.brand.logo)
                              .width(48)
                              .height(48)
                              .url()
                          : `https://source.unsplash.com/featured/48x48?${encodeURIComponent(
                              product.brand.name,
                            )}`
                      }
                      width={24}
                      height={24}
                      alt={product.brand?.logo?.alt || ''}
                    />
                    <span className="text-lg font-bold">{product.brand.name}</span>
                  </div>
                </div>
              )}

              <form className="mt-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Add to bag
                </button>
              </form>
            </div>

            <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
              {/* Description and details */}
              <div>
                <h3 className="sr-only">Description</h3>

                <div className="space-y-6 text-base text-gray-900">
                  {product.description ? (
                    <PortableText value={product.description} />
                  ) : (
                    'No description'
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      )}
      {
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h1 className="sr-only">Recent products</h1>

          {loadingShoes ? (
            <div className="animate-pulse">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {products?.map?.((product, i) => (
                <Link
                  key={product.slug.current}
                  to={`/shoes/${product.slug.current}`}
                  className="group relative"
                >
                  <div className="aspect-h-1 aspect-w-1 xl:aspect-h-8 xl:aspect-w-7 w-full overflow-hidden rounded-lg bg-gray-200">
                    <img
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
                  <p className="absolute bottom-0 left-0 mt-1 text-lg font-medium text-gray-900">
                    {product.price ? formatCurrency(product.price) : 'FREE'}
                  </p>
                  {product.brand && (
                    <div className="absolute bottom-0.5 right-0 flex items-center gap-x-2">
                      <img
                        className="h-6 w-6 rounded-full bg-gray-50"
                        src={
                          product.brand?.logo?.asset
                            ? urlForCrossDatasetReference(product.brand.logo)
                                .width(48)
                                .height(48)
                                .url()
                            : `https://source.unsplash.com/featured/48x48?${
                                product.brand.name
                                  ? encodeURIComponent(product.brand.name)
                                  : `brand&r=${i}`
                              }`
                        }
                        width={24}
                        height={24}
                        alt={product.brand?.logo?.alt || ''}
                      />
                      <span className="font-bold text-gray-600">{product.brand.name}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      }
    </div>
  )
}
