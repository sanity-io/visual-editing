import {SimpleContent} from '@/components/page'
import {Slideshow} from '@/components/slideshow'
import {dataAttribute} from '@/sanity/dataAttribute'
import {sanityFetch} from '@/sanity/live'
import type {SanityArrayValue, SanityImageValue} from '@/sanity/types'
import {defineQuery} from 'next-sanity'

export interface ProductData {
  _id: string
  title?: string
  media?: SanityArrayValue<SanityImageValue>[]
  description?: any[]
  details?: {
    _type: 'details'
    materials?: string
    collectionNotes?: any[]
    performance?: any[]
    ledLifespan?: string
    certifications?: string[]
  }
}

const productSlugsQuery = defineQuery(
  /* groq */ `*[_type == "product" && defined(slug.current)]{"slug": slug.current}`,
)
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: productSlugsQuery,
    stega: false,
    perspective: 'published',
  })
  return data
}

const productPageQuery = defineQuery(`*[_type == "product" && slug.current == $slug][0]`)

export default async function ProductPage({params}: {params: Promise<{slug: string}>}) {
  // @TODO fix typegen vs manual types issues
  const {data} = (await sanityFetch({
    query: productPageQuery,
    params,
  })) as unknown as {
    data: ProductData | null
  }

  return (
    <main className="mx-auto max-w-4xl p-5">
      <h1 className="text-2xl font-extrabold sm:text-4xl">{data?.title}</h1>

      <div className="mt-5 gap-5 sm:flex">
        <div className="-mx-5 flex-1 sm:m-0">
          {data?.media && (
            <div
              data-sanity={dataAttribute({
                id: data?._id,
                type: 'product',
                path: 'media',
              }).toString()}
            >
              <Slideshow images={data?.media} />
            </div>
          )}
        </div>

        <div className="mt-5 flex-1 sm:mt-0">
          {data?.description && (
            <div
              className="text-lg text-gray-600 md:text-xl dark:text-gray-400"
              data-sanity={dataAttribute({
                id: data?._id,
                type: 'product',
                path: 'description',
              }).toString()}
            >
              <SimpleContent value={data?.description} />
            </div>
          )}

          {data?.details && (
            <div className="mt-5">
              {data?.details.materials && (
                <div className="mt-4">
                  <div className="font-bold">Materials</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {data?.details.materials}
                  </div>
                </div>
              )}

              {data?.details.collectionNotes && (
                <div className="mt-4">
                  <div className="font-bold">Collection Notes</div>
                  <div
                    className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                    data-sanity={dataAttribute({
                      id: data?._id,
                      type: 'product',
                      path: 'details.collectionNotes',
                    }).toString()}
                  >
                    <SimpleContent value={data?.details.collectionNotes} />
                  </div>
                </div>
              )}

              {data?.details.performance && (
                <div className="mt-4">
                  <div className="font-bold">Performance</div>
                  <div
                    className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                    data-sanity={dataAttribute({
                      id: data?._id,
                      type: 'product',
                      path: 'details.performance',
                    }).toString()}
                  >
                    <SimpleContent value={data?.details.performance} />
                  </div>
                </div>
              )}

              {data?.details.ledLifespan && (
                <div className="mt-4">
                  <div className="font-bold">LED Lifespan</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {data?.details.ledLifespan}
                  </div>
                </div>
              )}

              {data?.details.certifications && (
                <div className="mt-4">
                  <div className="font-bold">Certifications</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {data?.details.certifications.map((d, idx) => <div key={idx}>{d}</div>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
