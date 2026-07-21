import {useMemo} from 'react'
import {useParams} from 'react-router'

import {Image} from '@/components/Image'
import {SimpleContent} from '@/components/SimpleContent'
import type {ProductPageQueryResult} from '@/sanity.types'
import {dataAttribute} from '@/sanity/dataAttribute'
import {useQuery} from '@/sanity/loader'
import {productPageQuery} from '@/sanity/queries'

export function ProductPage() {
  const {slug} = useParams<{slug: string}>()
  const params = useMemo(() => ({slug: slug!}), [slug])
  const {data} = useQuery<ProductPageQueryResult>(productPageQuery, params)

  return (
    <main className="mx-auto max-w-4xl p-5">
      <h1 className="text-2xl font-extrabold sm:text-4xl">{data?.title}</h1>

      <div className="mt-5 gap-5 sm:flex">
        <div className="-mx-5 flex-1 sm:m-0">
          {data?.media?.[0] && (
            <div
              data-sanity={dataAttribute({
                id: data._id,
                type: 'product',
                path: 'media',
              }).toString()}
            >
              <Image alt="" className="w-full" value={data.media[0]} width={1200} height={1200} />
            </div>
          )}
        </div>

        <div className="mt-5 flex-1 sm:mt-0">
          {data?.description && (
            <div
              className="text-lg text-gray-600 md:text-xl dark:text-gray-400"
              data-sanity={dataAttribute({
                id: data._id,
                type: 'product',
                path: 'description',
              }).toString()}
            >
              <SimpleContent value={data.description} />
            </div>
          )}

          {data?.details && (
            <div className="mt-5">
              {data.details.materials && (
                <div className="mt-4">
                  <div className="font-bold">Materials</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {data.details.materials}
                  </div>
                </div>
              )}

              {data.details.ledLifespan && (
                <div className="mt-4">
                  <div className="font-bold">LED Lifespan</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {data.details.ledLifespan}
                  </div>
                </div>
              )}

              {data.details.certifications && (
                <div className="mt-4">
                  <div className="font-bold">Certifications</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {data.details.certifications.map((d, idx) => (
                      <div key={idx}>{d}</div>
                    ))}
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
