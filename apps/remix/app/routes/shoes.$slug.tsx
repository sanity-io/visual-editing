import { type LoaderFunction, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { type ShoeParams, type ShoeResult, shoe } from 'apps-common/queries'
import { formatCurrency } from 'apps-common/utils'
import { useSourceDocuments } from '~/useChannel'
import { defineDataAttribute, getClient, urlFor } from '~/utils'
import { PortableText } from '@portabletext/react'

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
  })
}

export default function ShoePage() {
  const data = useLoaderData<typeof loader>()
  console.log({ data })
  const dataAttribute = defineDataAttribute(data.resultSourceMap)
  const result: ShoeResult = data.result
  useSourceDocuments(data.resultSourceMap)

  const slug = data.params.slug
  const name = result.title || slug

  if (!slug) {
    throw new Error('No slug, 404?')
  }

  const [coverImage, ...otherImages] = result.media || []

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
          <li className="text-sm">
            <Link
              to={`/shoes/${slug}`}
              aria-current="page"
              className="font-medium text-gray-500 hover:text-gray-600"
            >
              {name}
            </Link>
          </li>
        </ol>
      </nav>

      <article data-sanity={dataAttribute(['slug'])}>
        {coverImage?.asset && (
          <div className="mx-auto max-w-2xl px-4 pt-16 sm:px-6 lg:max-w-7xl lg:px-8 lg:pt-24">
            <img
              className="aspect-video w-full rounded-lg object-cover object-center group-hover:opacity-75"
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
                      className="h-40 w-80 shrink-0 rounded-lg bg-white shadow-xl"
                      src={urlFor(image)
                        .width(1280 * 2)
                        .height(720 * 2)
                        .url()}
                      width={1280}
                      height={720}
                      data-sanity={dataAttribute(['media', i, 'alt'])}
                      alt={image.alt || ''}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {/* <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
        {result.media?.[0] && <div className="aspect-h-4 aspect-w-3 hidden overflow-hidden rounded-lg lg:block">
          <img
            src={result.images[0].src}
            alt={product.images[0].alt}
            className="h-full w-full object-cover object-center"
          />
        </div>}
        <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
          <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
            <img
              src={product.images[1].src}
              alt={product.images[1].alt}
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
            <img
              src={product.images[2].src}
              alt={product.images[2].alt}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
        <div className="aspect-h-5 aspect-w-4 lg:aspect-h-4 lg:aspect-w-3 sm:overflow-hidden sm:rounded-lg">
          <img
            src={product.images[3].src}
            alt={product.images[3].alt}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div> */}

        {/* Product info */}
        <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1
              className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
              data-sanity={dataAttribute(['title'])}
              style={{ ['textWrap' as any]: 'balance' }}
            >
              {result.title}
            </h1>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            <p
              className="text-3xl tracking-tight text-gray-900"
              data-sanity={dataAttribute(['price'])}
            >
              {result.price ? formatCurrency(result.price) : 'FREE'}
            </p>

            <form className="mt-10">
              <button
                type="button"
                className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                {(result.description && (
                  <PortableText value={result.description} />
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
