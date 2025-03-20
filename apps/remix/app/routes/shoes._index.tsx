import {Link, useLoaderData} from '@remix-run/react'
import {ClientPerspective} from '@sanity/client'
import {useQuery} from '@sanity/react-loader'
import {json} from '@vercel/remix'
import {shoesList, type ShoesListResult} from '~/queries'
import {urlFor, urlForCrossDatasetReference} from '~/sanity'
import {loadQuery} from '~/sanity.loader.server'
import {formatCurrency} from '~/utils'

export const loader = async ({request}: {request: Request}) => {
  const url = new URL(request.url)
  const perspective = url.searchParams.get('sanity-preview-perspective')?.split(',') as
    | ClientPerspective
    | undefined

  return json({
    initial: await loadQuery<ShoesListResult>(shoesList, {}, {perspective}),
  })
}
export default function ShoesPage() {
  const {initial} = useLoaderData<typeof loader>()
  const {
    data: products,
    error,
    loading: _loading,
  } = useQuery<ShoesListResult>(shoesList, {}, {initial})

  if (error) {
    throw error
  }

  // Only consider it to be loading if there are no products
  const loading = _loading && !products?.length

  return (
    <div className="min-h-screen bg-white">
      <nav aria-label="Breadcrumb" className="pt-16 sm:pt-24">
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

        {loading ? (
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
    </div>
  )
}
