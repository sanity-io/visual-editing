import {WrappedValue, unwrapData} from '@sanity/react-loader/jsx'
import {sanity} from '@sanity/react-loader/jsx'
import {stegaClean} from '@sanity/client/stega'
import {createDataAttribute} from '@sanity/core-loader/create-data-attribute'

import {AppLayout} from '@/app/AppLayout'
import {SiteSettingsData} from '@/app/types'
import {SanityArrayValue, SanityImageValue, dataAttribute} from '@/sanity'
import {SimpleContent} from '@/components/page'
import {Slideshow} from '@/components/slideshow'
import {ProductModel} from './ProductModel'
import {useMemo} from 'react'

export interface ProductData {
  _id: string
  _type: string
  title?: string
  media?: SanityArrayValue<SanityImageValue>[]
  description?: any[]
  model?: {
    _type: 'model'
    file?: {
      asset: {
        extension: string
        originalFilename: string
        url: string
      }
    }
    rotation?: {
      x?: number
      y?: number
      z?: number
    }
    light?: {
      intensity?: number
    }
  }
  details?: {
    _type: 'details'
    materials?: string
    collectionNotes?: any[]
    performance?: any[]
    ledLifespan?: string
    certifications?: string[]
  }
}

export interface ProductPageData {
  product: ProductData | null
  siteSettings: SiteSettingsData | null
}

export function ProductPage(props: {data: WrappedValue<ProductPageData>}) {
  const {data} = props

  const model = useMemo(() => {
    if (!data.product?.model) return undefined
    const {file, rotation, light} = unwrapData(stegaClean(data.product.model))
    if (!file || file.asset.extension !== 'glb') return undefined

    return {
      uri: file.asset.url,
      rotation: [rotation?.x || 0, rotation?.y || 0, rotation?.z || 0] as [number, number, number],
      intensity: light?.intensity || 0,
    }
  }, [data])

  return (
    <AppLayout data={{siteSettings: data.siteSettings}}>
      <main className="mx-auto max-w-4xl p-5">
        <h1 className="text-2xl font-extrabold sm:text-4xl">
          <sanity.span>{data?.product?.title}</sanity.span>
        </h1>

        <div className="mt-5 gap-5 sm:flex">
          <div className="-mx-5 flex-1 sm:m-0">
            {data?.product?.media && (
              <div
                data-sanity={dataAttribute({
                  id: data.product?._id,
                  type: 'product',
                  path: 'media',
                })}
              >
                <Slideshow images={data.product?.media} />
              </div>
            )}
          </div>

          <div className="mt-5 flex-1 sm:mt-0">
            {data?.product?.description && (
              <div
                className="text-lg text-gray-600 md:text-xl dark:text-gray-400"
                data-sanity={dataAttribute({
                  id: data.product?._id,
                  type: 'product',
                  path: 'description',
                })}
              >
                <SimpleContent value={data.product?.description} />
              </div>
            )}

            {data?.product?.details && (
              <div className="mt-5">
                {data.product?.details.materials && (
                  <div className="mt-4">
                    <div className="font-bold">Materials</div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <sanity.span>{data.product?.details.materials}</sanity.span>
                    </div>
                  </div>
                )}

                {data.product?.details.collectionNotes && (
                  <div className="mt-4">
                    <div className="font-bold">Collection Notes</div>
                    <div
                      className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                      data-sanity={dataAttribute({
                        id: data.product?._id,
                        type: 'product',
                        path: 'details.collectionNotes',
                      })}
                    >
                      <SimpleContent value={data.product?.details.collectionNotes} />
                    </div>
                  </div>
                )}

                {data.product?.details.performance && (
                  <div className="mt-4">
                    <div className="font-bold">Performance</div>
                    <div
                      className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                      data-sanity={dataAttribute({
                        id: data.product?._id,
                        type: 'product',
                        path: 'details.performance',
                      })}
                    >
                      <SimpleContent value={data.product?.details.performance} />
                    </div>
                  </div>
                )}

                {data.product?.details.ledLifespan && (
                  <div className="mt-4">
                    <div className="font-bold">LED Lifespan</div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <sanity.span>{data.product?.details.ledLifespan}</sanity.span>
                    </div>
                  </div>
                )}

                {data.product?.details.certifications && (
                  <div className="mt-4">
                    <div className="font-bold">Certifications</div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {data.product?.details.certifications.map((d, idx) => (
                        <sanity.div key={idx}>{d}</sanity.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {model && (
        <div
          style={{height: '40rem', width: '100%'}}
          className="mt-5"
          data-sanity={
            data.product &&
            createDataAttribute({
              id: data.product?._id,
              type: data.product?._type,
              path: 'model',
            })()
          }
        >
          <ProductModel model={model} />
        </div>
      )}
    </AppLayout>
  )
}
