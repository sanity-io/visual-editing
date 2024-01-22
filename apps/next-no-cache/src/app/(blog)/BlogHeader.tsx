'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Balancer from 'react-wrap-balancer'

export default function BlogHeader({ title }: { title: string }) {
  const pathname = usePathname()
  if (pathname === '/') {
    return (
      <header className="mx-5 mb-10 mt-16 flex flex-col items-center md:mb-12 md:flex-row md:justify-between">
        <h1 className="text-6xl font-bold leading-tight tracking-tighter md:pr-8 md:text-8xl">
          <Balancer>{title}</Balancer>
        </h1>
      </header>
    )
  }
  return (
    <header className="mx-5">
      <h2 className="mb-20 mt-8 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
        <Link href="/" className="hover:underline">
          <Balancer>{title}</Balancer>
        </Link>
      </h2>
    </header>
  )
}
