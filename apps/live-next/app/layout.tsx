import './globals.css'
import {sanityFetch, SanityLive} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata} from 'next'
import {toPlainText, type PortableTextBlock} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'
import {Inter} from 'next/font/google'
import {draftMode} from 'next/headers'
import {Suspense} from 'react'
import {Toaster} from 'sonner'
import AlertBanner from './alert-banner'
import {handleError, revalidateSyncTags} from './actions.client'
import {DraftModeStatus} from './draft-mode-status'
import PortableText from './portable-text'

export async function generateMetadata(): Promise<Metadata> {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  })

  const ogImage = resolveOpenGraphImage(settings?.ogImage)
  let metadataBase: URL | undefined = undefined
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined
  } catch {
    // ignore
  }
  return {
    metadataBase,
    title: settings?.title
      ? {
          template: `%s | ${settings.title}`,
          default: settings.title,
        }
      : undefined,
    description: settings?.description ? toPlainText(settings.description) : undefined,
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

async function Footer() {
  const {data} = await sanityFetch({query: settingsQuery})
  const footer = data?.footer || []

  return (
    <footer className="bg-accent-1 border-accent-2 border-t">
      <div className="container mx-auto px-5">
        {footer?.length > 0 && (
          <PortableText
            className="prose-sm bottom-0 w-full max-w-none text-pretty bg-white py-12 text-center md:py-20"
            value={footer as PortableTextBlock[]}
          />
        )}
      </div>
    </footer>
  )
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {data} = await sanityFetch({query: settingsQuery})
  return (
    <html
      lang="en"
      className={`${inter.variable} bg-theme text-theme transition-colors duration-1000`}
      style={{
        ['--theme-background' as string]: data?.theme?.background?.hex,
        ['--theme-text' as string]: data?.theme?.text?.hex,
      }}
    >
      <body>
        <section className="min-h-screen">
          {(await draftMode()).isEnabled && <AlertBanner />}
          <DraftModeStatus />
          <main>{children}</main>
          <Suspense>
            <Footer />
          </Suspense>
        </section>
        <Toaster />
        {(await draftMode()).isEnabled && <VisualEditing />}
        <SanityLive
          refreshOnFocus
          refreshOnReconnect
          onError={handleError}
          revalidateSyncTags={revalidateSyncTags}
        />
        <SpeedInsights />
      </body>
    </html>
  )
}
