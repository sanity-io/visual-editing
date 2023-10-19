import './globals.css'
import type { Metadata } from 'next'
import { IBM_Plex_Mono, Inter, PT_Serif } from 'next/font/google'
import VisualEditing from './VisualEditing'

const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500', '700'],
})

const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['500', '700', '800'],
})

const serif = PT_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
})

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
        className={`${mono.className} ${sans.className} ${serif.className} bg-white text-black dark:bg-black dark:text-white`}
      >
        {children}
      </body>

      <VisualEditing />
    </html>
  )
}
