import {Suspense} from 'react'
import dynamic from 'next/dynamic'
import {revalidateTag, unstable_cache} from 'next/cache'

import '../../tailwind.css'
import {draftMode} from 'next/headers'
import {Metadata} from 'next'

const LiveVisualEditing = dynamic(() => import('./VisualEditing'))
import {Timesince} from '../Timesince'

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        {children}
        {draftMode().isEnabled && <LiveVisualEditing />}
        <a
          href={draftMode().isEnabled ? '/api/disable-draft' : undefined}
          title={draftMode().isEnabled ? 'Click to disable Draft Mode' : undefined}
          className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100"
        >
          app-router:{' '}
          {draftMode().isEnabled
            ? 'draftMode'
            : process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'}
          {', '}
          <span className="text-slate-300">
            served: <Timesince since={await getCachedServed()} />
          </span>
        </a>
      </body>
    </html>
  )
}

const getCachedServed = unstable_cache(async () => new Date().toJSON(), ['shoes-test'], {
  revalidate: 1,
})
