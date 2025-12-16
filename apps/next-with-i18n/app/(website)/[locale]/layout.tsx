import 'tailwindcss/tailwind.css'
import {Metadata} from 'next'
import {VisualEditing} from 'next-sanity/visual-editing'
import {revalidatePath, revalidateTag} from 'next/cache'
import {Inter} from 'next/font/google'
import {draftMode} from 'next/headers'

import config from '@/config'

export const metadata: Metadata = {
  title: `${config.siteName} - Website`,
}

const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{locale: string}>
  children: React.ReactNode
}) {
  const {locale} = await params
  return (
    <html lang={locale} className={sans.variable}>
      <body>
        {children}
        {(await draftMode()).isEnabled && (
          <VisualEditing
            refresh={async (payload) => {
              'use server'
              if (!(await draftMode()).isEnabled) {
                console.debug('Skipped manual refresh because draft mode is not enabled')
                return
              }
              if (payload.source === 'mutation') {
                if (payload.document.slug?.current) {
                  const tag = `${payload.document._type}:${payload.document.slug.current}`
                  console.log('Revalidate slug', tag)
                  await revalidateTag(tag, {expire: 0})
                }
                console.log('Revalidate tag', payload.document._type)
                return revalidateTag(payload.document._type, {expire: 0})
              }
              await revalidatePath('/', 'layout')
            }}
          />
        )}
      </body>
    </html>
  )
}
