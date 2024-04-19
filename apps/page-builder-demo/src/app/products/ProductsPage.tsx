import {WrappedValue, unwrapData} from '@sanity/react-loader/jsx'
import {sanity} from '@sanity/react-loader/jsx'
import Link from 'next/link'

import {AppLayout} from '../AppLayout'
import {SiteSettingsData} from '../types'
import {Image} from '@/components/image'
import {SimpleContent} from '@/components/page'
import {SanityArrayValue, SanityImageValue, dataAttribute} from '@/sanity'

export interface ProductsPageData {
  products: {
    _id: string
    title?: string
    description?: any[]
    slug: {
      current: string
    }
    media?: SanityArrayValue<SanityImageValue>
  }[]
  siteSettings: SiteSettingsData | null
}

export function ProductsPage(props: {data: WrappedValue<ProductsPageData>}) {
  const {data} = props

  return (
    <AppLayout data={{siteSettings: data.siteSettings}}>
      <main className="mx-auto max-w-4xl">
        <div className="p-5">
          <h1 className="text-2xl font-extrabold">Products</h1>
        </div>

        <div>
          {data.products?.length > 0 && (
            <div className="flex flex-col gap-2">
              {data.products.map((product) => (
                <Link
                  className="block rounded border border-white p-4 hover:border-gray-100 sm:flex sm:gap-5 dark:border-black dark:hover:border-gray-800"
                  href={product.slug?.current && `/product/${product.slug.current.value}`}
                  key={product._id}
                >
                  <div className="flex-none sm:w-64">
                    {product.media?.asset && (
                      <Image
                        alt=""
                        data-sanity={dataAttribute({
                          id: product._id,
                          type: 'product',
                          path: `media[_key=="${product.media._key}"]`,
                        })}
                        value={unwrapData(product.media)}
                      />
                    )}
                  </div>
                  <div className="mt-5 flex-1 sm:mt-0">
                    <div className="text-2xl font-bold">
                      {product.title ? (
                        <sanity.span>{product.title}</sanity.span>
                      ) : (
                        <em>Untitled</em>
                      )}
                    </div>

                    {product.description && (
                      <div
                        className="text-md mt-2 text-gray-600 dark:text-gray-400"
                        data-sanity={dataAttribute({
                          id: product._id,
                          type: 'product',
                          path: 'description',
                        })}
                      >
                        <SimpleContent value={product.description} />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
