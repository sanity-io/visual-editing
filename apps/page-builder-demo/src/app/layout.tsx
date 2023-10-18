import './globals.css'
import type { Metadata } from 'next'
import { IBM_Plex_Mono, Inter } from 'next/font/google'
import VisualEditing from './VisualEditing'

const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '700'] })
const sans = Inter({ subsets: ['latin'], weight: ['500', '700', '800'] })

export const metadata: Metadata = {
  title: '',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${sans.className} ${mono.className} bg-white text-black dark:bg-black dark:text-white`}
      >
        {children}
      </body>

      <VisualEditing />
    </html>
  )
}
