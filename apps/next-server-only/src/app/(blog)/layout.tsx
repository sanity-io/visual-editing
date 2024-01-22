import Link from 'next/link'

import BlogHeader from './BlogHeader'
import { EXAMPLE_NAME } from '@/lib/constants'
import PreviewBanner from './PreviewBanner'
import { draftMode } from 'next/headers'
import dynamic from 'next/dynamic'

const Overlays = dynamic(() => import('@/components/VisualEditing/Overlays'))
const PresentationToolBridge = dynamic(
  () => import('@/components/VisualEditing/PresentationToolBridge'),
)

export const runtime = 'edge'

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
      {draftMode().isEnabled && <Overlays />}
      {draftMode().isEnabled && <PresentationToolBridge />}
    </>
  )
}
