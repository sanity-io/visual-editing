'use client'

import {shoe} from '@/queries'
import type {ShoeResult} from '@/types'
import {formatCurrency} from '@/utils'
import {PortableText} from '@portabletext/react'
import {LemonIcon} from '@sanity/icons'
import {usePresentationQuery} from 'next-sanity/hooks'
import Image from 'next/image'
import Link from 'next/link'
import {use} from 'react'
import {urlFor, urlForCrossDatasetReference} from '../utils'

type Props = {
  params: Promise<{slug: string}>
  initial: ShoeResult
}

export default function ShoePage(props: Props) {
  const params = use(props.params)
  const optimistic = usePresentationQuery({query: shoe, params})
  const product = optimistic.data || props.initial

  const [coverImage, ...otherImages] = product?.media || []

  return (
    <div className="min-h-screen bg-white">
      <nav aria-label="Breadcrumb" className="pt-16 sm:pt-24">
        <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <li>
            <div className="flex items-center">
              <Link href="/shoes" className="mr-2 text-sm font-medium text-gray-900">
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
              href={`/shoes/${params.slug}`}
              aria-current="page"
              className="font-medium text-gray-500 hover:text-gray-600"
            >
              {product?.title || 'Untitled'}
            </Link>
          </li>
          <li>
            <a
              href={`https://visual-editing-studio.sanity.dev/next/app-router?${new URLSearchParams({preview: `/shoes/${params.slug}`})}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Edit this page
            </a>
          </li>
        </ol>
      </nav>

      {product && (
        <article>
          {coverImage?.asset && (
            <div className="mx-auto max-w-2xl px-4 pt-16 sm:px-6 lg:max-w-7xl lg:px-8 lg:pt-24">
              <Image
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
                {otherImages.map?.((image, _i) => {
                  if (!image.asset?._ref) return null
                  // The index is wrong due to slicing out `coverImage`
                  const i = _i + 1

                  return (
                    <div key={(image.asset._ref as string) || i} className="shrink-0 snap-start">
                      <Image
                        className="h-32 w-40 shrink-0 rounded bg-white shadow-xl lg:rounded-lg"
                        src={urlFor(image)
                          .width(1280 / 2)
                          .height(720 / 2)
                          .url()}
                        width={1280 / 2}
                        height={720 / 2}
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

              {
                // @ts-expect-error - cross dataset reference typegen not working yet
                product.brand?.name && (
                  <div>
                    <h2 className="text-sm font-medium text-gray-900">Brand</h2>
                    <div className="flex items-center gap-x-2">
                      <Image
                        className="h-10 w-10 rounded-full bg-gray-50"
                        src={
                          // @ts-expect-error - cross dataset reference typegen not working yet
                          product.brand?.logo?.asset
                            ? // @ts-expect-error - cross dataset reference typegen not working yet
                              urlForCrossDatasetReference(product.brand.logo)
                                .width(48)
                                .height(48)
                                .url()
                            : `https://source.unsplash.com/featured/48x48?${encodeURIComponent(
                                // @ts-expect-error - cross dataset reference typegen not working yet
                                product.brand.name,
                              )}`
                        }
                        width={24}
                        height={24}
                        // @ts-expect-error - cross dataset reference typegen not working yet
                        alt={product.brand?.logo?.alt || ''}
                      />
                      <span className="text-lg font-bold">
                        {
                          // @ts-expect-error - cross dataset reference typegen not working yet
                          product.brand.name
                        }
                      </span>
                    </div>
                  </div>
                )
              }

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
            <LemonIcon
              aria-label={product.title || ''}
              className="right bottom-1 right-1 block h-8 w-8 text-slate-900"
            />
          </div>
        </article>
      )}
    </div>
  )
}
