import Link from 'next/link'

import BlogHeader from './BlogHeader'
import { EXAMPLE_NAME } from '@/lib/constants'
import PreviewBanner from './PreviewBanner'
import { draftMode } from 'next/headers'
import dynamic from 'next/dynamic'
import { revalidatePath, revalidateTag } from 'next/cache'

const VisualEditing = dynamic(() => import('./VisualEditing'))

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {draftMode().isEnabled && <PreviewBanner />}
      <div className="container mx-auto min-h-screen">
        <BlogHeader title={EXAMPLE_NAME} />
        <main className="mx-auto px-5">{children}</main>
        <footer className="px-5 pb-10">
          <hr className="border-accent-2 mb-24 mt-28" />
          <Link href="/studio" className="hover:underline">
            Studio
          </Link>
        </footer>
      </div>
      {draftMode().isEnabled && (
        <VisualEditing
          refresh={async (payload) => {
            'use server'
            if (!draftMode().isEnabled) {
              console.debug(
                'Skipped manual refresh because draft mode is not enabled',
              )
              return
            }
            if (payload.source === 'mutation') {
              if (payload.document.slug?.current) {
                const tag = `${payload.document._type}:${payload.document.slug.current}`
                console.log('Revalidate slug', tag)
                await revalidateTag(`previewDrafts:${tag}`)
              }
              console.log('Revalidate tag', payload.document._type)
              return revalidateTag(`previewDrafts:${payload.document._type}`)
            }
            await revalidatePath('/', 'layout')
          }}
        />
      )}
    </>
  )
}
