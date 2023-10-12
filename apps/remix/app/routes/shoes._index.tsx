import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { formatCurrency } from 'apps-common/utils'
import { shoesList, type ShoesListResult } from 'apps-common/queries'
import {
  getClient,
  urlFor,
  urlForCrossDatasetReference,
  defineDataAttribute,
} from '~/utils'
import { useSourceDocuments } from '~/useChannel'

export async function loader() {
  const client = getClient()
  const { result, resultSourceMap } = await client.fetch<ShoesListResult>(
    shoesList,
    {},
    { filterResponse: false },
  )

  return json({
    vercelEnv: process.env.VERCEL_ENV || 'development',
    result,
    resultSourceMap,
  })
}

export default function ProductsRoute() {
  const data = useLoaderData<typeof loader>()
  const dataAttribute = defineDataAttribute(data.resultSourceMap)
  useSourceDocuments(data.resultSourceMap)

  return (
    <div className="bg-white">
      <nav aria-label="Breadcrumb" className="py-4">
        <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <li>
            <div className="flex items-center">
              <Link
                to="/shoes"
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

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {data.result.map((product, i) => (
            <Link
              key={product.slug.current}
              to={`/shoes/${product.slug.current}`}
              data-sanity={dataAttribute([i, 'slug'])}
              className="group relative"
            >
              <div className="aspect-h-1 aspect-w-1 xl:aspect-h-8 xl:aspect-w-7 w-full overflow-hidden rounded-lg bg-gray-200">
                <img
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                  src={
                    product.media?.asset
                      ? urlFor(product.media).height(1440).width(1440).url()
                      : `https://source.unsplash.com/featured/720x720?shoes&r=${i}`
                  }
                  width={720}
                  height={720}
                  data-sanity={dataAttribute([i, 'media', 'alt'])}
                  alt={product.media?.alt || ''}
                />
              </div>
              <h2
                className="mb-8 mt-4 text-sm text-gray-700"
                data-sanity={dataAttribute([i, 'title'])}
                style={{ ['textWrap' as any]: 'balance' }}
              >
                {product.title}
              </h2>
              <p
                className="absolute bottom-0 left-0 mt-1 text-lg font-medium text-gray-900"
                data-sanity={dataAttribute([i, 'price'])}
              >
                {product.price ? formatCurrency(product.price) : 'FREE'}
              </p>
              {product.brand && (
                <div className="absolute bottom-0.5 right-0 flex items-center gap-x-2">
                  <img
                    className="h-6 w-6 rounded-full bg-gray-50"
                    src={
                      product.brand?.logo?.asset
                        ? urlForCrossDatasetReference(product.brand.logo)
                            .height(48)
                            .width(48)
                            .url()
                        : `https://source.unsplash.com/featured/48x48?${
                            product.brand.name
                              ? encodeURIComponent(product.brand.name)
                              : `brand&r=${i}`
                          }`
                    }
                    width={24}
                    height={24}
                    data-sanity={dataAttribute([i, 'brand', 'logo', 'alt'])}
                    alt={product.brand?.logo?.alt || ''}
                  />
                  <span className="font-bold text-gray-600">
                    {product.brand.name}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
      <span className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100">
        {data.vercelEnv}
      </span>
    </div>
  )
}
