import './globals.css'

import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import {SpeedInsights} from '@vercel/speed-insights/next'

import {CMS_NAME} from '@/lib/constants'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: `Next.js and ${CMS_NAME} Example`,
  description: `This is a blog built with Next.js and ${CMS_NAME}.`,
} satisfies Metadata

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-black">
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
