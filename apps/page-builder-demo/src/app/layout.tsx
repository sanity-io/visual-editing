import './globals.css'
import {layoutQuery} from '@repo/page-builder-shared'
import {validateApiPerspective, type ClientPerspective} from '@sanity/client'
import {perspectiveCookieName, variantCookieName} from '@sanity/preview-url-secret/constants'
import type {Metadata} from 'next'
import {VisualEditing} from 'next-sanity/visual-editing'
import {IBM_Plex_Mono, Inter, Libre_Caslon_Text} from 'next/font/google'
import {cookies, draftMode} from 'next/headers'

import {plugins} from '@/components/overlay-plugins'
import {components} from '@/components/overlays/resolver'
import {sanityFetch, SanityLive} from '@/sanity/live'

import AlertBanner from './alert-banner'
import {AppLayout} from './AppLayout'
import {DraftModeStatus} from './draft-mode-status'
import {DemoPageBuilderProvider} from './page-builder'

const serif = Libre_Caslon_Text({
  variable: '--font-serif',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  weight: ['400', '700'],
})
const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  // @todo: understand why extrabold (800) isn't being respected when explicitly specified in this weight array
  // weight: ['500', '700', '800'],
})
const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500', '700'],
})

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: layoutQuery, stega: false})
  return {
    title: data?.title
      ? {
          template: `%s | ${data.title}`,
          default: data.title,
        }
      : undefined,
    description: '',
  }
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {data} = await sanityFetch({query: layoutQuery})
  const {isEnabled: isDraftModeEnabled} = await draftMode()
  const perspective = isDraftModeEnabled ? await resolvePerspectiveFromCookies() : 'published'
  const variant = isDraftModeEnabled ? await resolveVariantFromCookies() : null
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable} ${serif.variable}`}>
      <body className="bg-white text-black dark:bg-black dark:text-white">
        {isDraftModeEnabled && <AlertBanner />}
        <DraftModeStatus perspective={perspective} variant={variant} />
        <DemoPageBuilderProvider>
          <AppLayout data={data}>{children}</AppLayout>
        </DemoPageBuilderProvider>
        {isDraftModeEnabled && <VisualEditing components={components} plugins={plugins} />}
        <SanityLive />
      </body>
    </html>
  )
}

async function resolvePerspectiveFromCookies(): Promise<Exclude<ClientPerspective, 'raw'>> {
  const jar = await cookies()
  return jar.has(perspectiveCookieName)
    ? sanitizePerspective(jar.get(perspectiveCookieName)?.value, 'drafts')
    : 'drafts'
}

async function resolveVariantFromCookies(): Promise<string | null> {
  const jar = await cookies()
  return jar.has(variantCookieName) ? (jar.get(variantCookieName)?.value ?? null) : null
}

function sanitizePerspective(
  _perspective: unknown,
  fallback: 'drafts' | 'published',
): Exclude<ClientPerspective, 'raw'> {
  const perspective =
    typeof _perspective === 'string' && _perspective.includes(',')
      ? _perspective.split(',')
      : _perspective
  try {
    validateApiPerspective(perspective)
    return perspective === 'raw'
      ? fallback
      : (Array.isArray(perspective) ? perspective.filter(Boolean) : perspective) || fallback
  } catch (err) {
    console.warn(`Invalid perspective:`, _perspective, perspective, err)
    return fallback
  }
}
