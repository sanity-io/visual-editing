'use client'

import {PageBuilderProvider} from '@repo/page-builder-shared'
import Link from 'next/link'
import type {ReactNode} from 'react'

import {Image} from '@/components/image'
import {ProductModel} from '@/components/page/ProductModel'
import {dataAttribute} from '@/sanity/dataAttribute'

/**
 * Wires the shared page-builder components up with the Next.js specific
 * pieces: next/link, the next/image based Image and the 3D intro model.
 */
export function DemoPageBuilderProvider({children}: {children: ReactNode}) {
  return (
    <PageBuilderProvider
      dataAttribute={dataAttribute}
      Link={Link}
      Image={Image}
      IntroModel={ProductModel}
    >
      {children}
    </PageBuilderProvider>
  )
}
