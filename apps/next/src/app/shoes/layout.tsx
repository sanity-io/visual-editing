import { Suspense } from 'react'

import VisualEditing from './VisualEditing'

import '../../tailwind.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Suspense>
          <VisualEditing />
        </Suspense>
        <span className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-xs text-slate-100">
          {process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'}
        </span>
      </body>
    </html>
  )
}
