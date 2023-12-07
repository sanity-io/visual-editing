import { Suspense } from 'react'

import VisualEditing from './VisualEditing'

import '../../tailwind.css'
import { draftMode } from 'next/headers'
import { Metadata } from 'next'

export const metadata = {
  referrer: 'no-referrer-when-downgrade',
} satisfies Metadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {draftMode().isEnabled && (
          <Suspense>
            <VisualEditing />
          </Suspense>
        )}
        <a
          href={draftMode().isEnabled ? '/api/disable-draft' : undefined}
          title={
            draftMode().isEnabled ? 'Click to disable Draft Mode' : undefined
          }
          className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100"
        >
          app-router:{' '}
          {draftMode().isEnabled
            ? 'draftMode'
            : process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'}
        </a>
      </body>
    </html>
  )
}
