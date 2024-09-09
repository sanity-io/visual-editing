import './globals.css'
import {sanityFetch, SanityLive} from '@/sanity/live'
import type {Metadata} from 'next'
import {defineQuery, VisualEditing} from 'next-sanity'
import {IBM_Plex_Mono, Inter, Libre_Caslon_Text} from 'next/font/google'
import {draftMode} from 'next/headers'
import AlertBanner from './alert-banner'
import {AppLayout} from './AppLayout'

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

const layoutQuery = defineQuery(`
  *[_id == "siteSettings"][0]{
  title,
  description,
  copyrightText
}`)

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
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable} ${serif.variable}`}>
      <body className="bg-white text-black dark:bg-black dark:text-white">
        {draftMode().isEnabled && <AlertBanner />}
        <AppLayout data={data}>{children}</AppLayout>
        {draftMode().isEnabled && <VisualEditing />}
        <SanityLive />
      </body>
    </html>
  )
}
