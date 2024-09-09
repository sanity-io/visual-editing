import {SanityLiveStream} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-5">
      <SanityLiveStream query={settingsQuery}>
        {async ({data: settings}) => {
          'use server'
          return (
            <>
              {settings?.title && (
                <h2 className="mb-16 mt-10 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
                  <Link href="/" className="hover:underline">
                    {settings.title}
                  </Link>
                </h2>
              )}
            </>
          )
        }}
      </SanityLiveStream>
      <h1 className="mb-12 text-balance text-6xl font-bold leading-tight tracking-tighter md:text-7xl md:leading-none lg:text-8xl">
        404 - Post not found
      </h1>
    </div>
  )
}
