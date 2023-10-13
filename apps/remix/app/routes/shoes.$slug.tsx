import { type LoaderFunction, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { type ShoeParams, type ShoeResult, shoe } from 'apps-common/queries'
import { formatCurrency } from 'apps-common/utils'
import {
  defineDataAttribute,
  getClient,
  urlFor,
  urlForCrossDatasetReference,
} from '~/utils'
import { PortableText } from '@portabletext/react'
import { createQueryStore } from '@sanity/react-loader'
import { useEffect, useState } from 'react'

export const loader: LoaderFunction = async ({ params }) => {
  const client = getClient()
  const { result, resultSourceMap } = await client.fetch<ShoeResult>(
    shoe,
    { slug: params.slug! } satisfies ShoeParams,
    { filterResponse: false },
  )

  return json({
    params,
    vercelEnv: process.env.VERCEL_ENV || 'development',
    result,
    resultSourceMap,
    // @TODO temp, pass token over composer channel instead
    token: process.env.SANITY_API_READ_TOKEN,
  })
}

export default function ShoePage() {
  const data = useLoaderData<typeof loader>()
  console.log({ data })
  const dataAttribute = defineDataAttribute(data.resultSourceMap)

  const slug = data.params.slug

  if (!slug) {
    throw new Error('No slug, 404?')
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const [client] = useState(() =>
    getClient().withConfig({ token: data.token! }),
  )
  const [{ useQuery }] = useState(() => createQueryStore({ client }))
  // const useQuery = defineUseQuery(client)
  const draftProduct = useQuery(shoe, { slug })

  const product = (
    mounted && !draftProduct.loading
      ? draftProduct.data
      : draftProduct.data || data.result
  ) as ShoeResult
  console.log({ draftProduct })

  const [coverImage, ...otherImages] = product.media || []

  console.log({ coverImage }, otherImages)

  return (
    <div className="min-h-screen bg-white">
      <nav aria-label="Breadcrumb" className="pt-16 sm:pt-24">
        <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <li>
            <div className="flex items-center">
              <Link
                to="/shoes"
                className="mr-2 text-sm font-medium text-gray-900"
              >
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
          <li className="text-sm" style={{ ['textWrap' as any]: 'balance' }}>
            <Link
              to={`/shoes/${slug}`}
              aria-current="page"
              className="font-medium text-gray-500 hover:text-gray-600"
            >
              {product.title}
            </Link>
          </li>
        </ol>
      </nav>

      <article data-sanity={dataAttribute(['slug'])}>
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
              data-sanity={dataAttribute(['media', 0, 'alt'])}
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
                      data-sanity={dataAttribute(['media', i, 'alt'])}
                      alt={image.alt || ''}
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
              data-sanity={dataAttribute(['title'])}
              style={{ ['textWrap' as any]: 'balance' }}
            >
              {product.title}
            </h1>
          </div>

          {/* Options */}
          <div className="mt-4 flex flex-col lg:row-span-3 lg:mt-0 lg:gap-y-6">
            <h2 className="sr-only">Product information</h2>
            <p
              className="text-3xl tracking-tight text-gray-900"
              data-sanity={dataAttribute(['price'])}
            >
              {product.price ? formatCurrency(product.price) : 'FREE'}
            </p>

            {product.brand?.name && (
              <div data-sanity={dataAttribute(['brand', 'name'])}>
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
                    data-sanity={dataAttribute(['brand', 'logo', 'alt'])}
                    alt={product.brand?.logo?.alt || ''}
                  />
                  <span className="text-lg font-bold">
                    {product.brand.name}
                  </span>
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

              <div
                className="space-y-6 text-base text-gray-900"
                data-sanity={dataAttribute(['description'])}
              >
                {(product.description && (
                  <PortableText value={product.description} />
                )) ||
                  'No description'}
              </div>
            </div>
          </div>
        </div>
      </article>

      <span className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100">
        {data.vercelEnv}
      </span>
    </div>
  )
}
