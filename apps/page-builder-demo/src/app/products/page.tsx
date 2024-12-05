import {Image} from '@/components/image'
import {SimpleContent} from '@/components/page'
import {dataAttribute} from '@/sanity/dataAttribute'
import {sanityFetch} from '@/sanity/live'
import {defineQuery} from 'next-sanity'
import Link from 'next/link'

const productsPageQuery = defineQuery(`
  *[_type == "product" && defined(slug.current)]{
    _id,
    title,
    description,
    slug,
    "media": media[0]
  }
`)

export default async function ProductsPage() {
  const {data} = await sanityFetch({query: productsPageQuery})

  return (
    <main className="mx-auto max-w-4xl">
      <div className="p-5">
        <h1 className="text-2xl font-extrabold">Products</h1>
      </div>

      <div>
        {data?.length > 0 && (
          <div className="flex flex-col gap-2">
            {data.map((product) => (
              <Link
                className="block rounded border border-white p-4 hover:border-gray-100 sm:flex sm:gap-5 dark:border-black dark:hover:border-gray-800"
                href={`/product/${product?.slug?.current}`}
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
                      }).toString()}
                      value={product.media}
                    />
                  )}
                </div>
                <div className="mt-5 flex-1 sm:mt-0">
                  <div className="text-2xl font-bold">
                    {product.title ? product.title : <em>Untitled</em>}
                  </div>

                  {product.description && (
                    <div
                      className="text-md mt-2 text-gray-600 dark:text-gray-400"
                      data-sanity={dataAttribute({
                        id: product._id,
                        type: 'product',
                        path: 'description',
                      }).toString()}
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
  )
}
