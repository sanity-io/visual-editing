import './globals.css'
import type {Metadata} from 'next'
import {Suspense, lazy} from 'react'

const VisualEditing = lazy(() => import('./VisualEditing'))

export const metadata: Metadata = {
  title: '',
  description: '',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;700&family=Inter:wght@500;700;800&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-black dark:bg-black dark:text-white">
        {children}
        <Suspense>
          <VisualEditing />
        </Suspense>
      </body>
    </html>
  )
}
