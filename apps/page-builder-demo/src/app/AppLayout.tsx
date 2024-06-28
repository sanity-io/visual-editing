import {CloseIcon, MenuIcon} from '@sanity/icons'
import {sanity, WrappedValue} from '@sanity/react-loader/jsx'
import clsx from 'clsx'
import {ReactNode, useState} from 'react'
import {SiteSettingsData} from './types'
import {usePathname} from 'next/navigation'
import Link from 'next/link'

const links = [
  // {
  //   href: '/projects',
  //   title: 'Projects',
  // },
  {
    href: '/products',
    title: 'Products',
  },
  {
    href: '/experiment',
    title: 'Experiment',
  },
  // {
  //   href: '/about',
  //   title: 'About',
  // },
]

export function AppLayout(props: {
  children?: ReactNode
  data: {siteSettings: WrappedValue<SiteSettingsData> | null}
}) {
  const {children, data} = props
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-4xl justify-between gap-2 p-4">
        <Link
          className="text-md block flex-none rounded p-3 font-bold leading-none hover:bg-gray-50 sm:ml-0 dark:hover:bg-gray-950"
          href="/"
        >
          <sanity.span>{data?.siteSettings?.title}</sanity.span>
        </Link>

        <button
          className="text-md inline-block flex-none rounded p-3 leading-none hover:bg-gray-50 sm:hidden dark:hover:bg-gray-950"
          onClick={() => setMenuOpen(true)}
          type="button"
        >
          <MenuIcon className="icon" />
        </button>

        <div className="hidden flex-1 gap-2 sm:flex">
          {links.map((link, idx) => (
            <Link
              className={clsx(
                'text-md rounded p-3 leading-none hover:bg-gray-50 dark:hover:bg-gray-950',
                link.href === pathname
                  ? 'bg-gray-50 text-black dark:bg-gray-950 dark:text-white'
                  : 'text-gray-600 active:text-black dark:text-gray-400 dark:active:text-white',
              )}
              href={link.href}
              key={idx}
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-white dark:bg-black" hidden={!menuOpen}>
        <div className="flex justify-between p-4">
          <Link
            className="text-md block p-3 font-bold leading-none"
            href="/"
            onClick={() => {
              setMenuOpen(false)
            }}
          >
            <sanity.span>{data?.siteSettings?.title}</sanity.span>
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

      <div className="flex-1" hidden={menuOpen}>
        {children}
      </div>

      <div className="p-5 text-xs text-gray-600 dark:text-gray-400" hidden={menuOpen}>
        <sanity.span>{data?.siteSettings?.copyrightText}</sanity.span>
      </div>
    </div>
  )
}
