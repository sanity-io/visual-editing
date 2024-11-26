'use client'

import type {LayoutQueryResult} from '@/sanity.types'
import {CloseIcon, MenuIcon} from '@sanity/icons'
import clsx from 'clsx'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useState} from 'react'

const links = [
  // {
  //   href: '/projects',
  //   title: 'Projects',
  // },
  {
    href: '/products',
    title: 'Products',
  },
  // {
  //   href: '/about',
  //   title: 'About',
  // },
]

export function AppLayout(props: {children: React.ReactNode; data: LayoutQueryResult}) {
  const {children, data} = props
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative z-40 p-4 transition-all duration-500 hover:bg-white hover:bg-opacity-50 sm:px-5 md:px-6">
        <div className="-mx-3 flex items-center justify-between gap-2">
          <Link className="text-md flex-none p-3 text-xl font-extrabold leading-none" href="/">
            {data?.title}
          </Link>

          <button
            className="text-md flex-none p-3 leading-none hover:bg-gray-50 sm:hidden dark:hover:bg-gray-950"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <MenuIcon className="icon" />
          </button>

          <div className="hidden flex-1 gap-2 sm:flex">
            {links.map((link, idx) => (
              <Link
                className={clsx(
                  'text-md rounded p-3 font-medium leading-none hover:opacity-100',
                  link.href === pathname ? 'opacity-100' : 'opacity-50',
                )}
                href={link.href}
                key={idx}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-50 bg-white dark:bg-black" hidden={!menuOpen}>
        <div className="-mx-3">
          <div className="flex justify-between p-4">
            <Link
              className="block p-3 text-xl font-extrabold leading-none"
              href="/"
              onClick={() => {
                setMenuOpen(false)
              }}
            >
              {data?.title}
            </Link>

            <button
              className="text-md rounded p-3 leading-none hover:bg-gray-50 dark:hover:bg-gray-950"
              onClick={() => setMenuOpen(false)}
              type="button"
            >
              <CloseIcon className="icon" />
            </button>
          </div>

          <div className="flex-1 gap-1">
            {links.map((link, idx) => (
              <Link
                className="text-md block p-5 leading-none text-gray-600 dark:text-gray-400"
                href={link.href}
                key={idx}
                onClick={() => {
                  setMenuOpen(false)
                }}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1" hidden={menuOpen}>
        {children}
      </div>

      <div className="p-5 text-xs text-gray-600 dark:text-gray-400" hidden={menuOpen}>
        {data?.copyrightText}
      </div>
    </div>
  )
}
