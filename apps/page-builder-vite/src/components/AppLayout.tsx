import type {ReactNode} from 'react'
import {Link, useLocation} from 'react-router'

import type {LayoutQueryResult} from '@/sanity.types'

const links = [
  {
    href: '/products',
    title: 'Products',
  },
]

export function AppLayout(props: {children: ReactNode; data: LayoutQueryResult}) {
  const {children, data} = props
  const {pathname} = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <div className="hover:bg-opacity-50 relative z-40 p-4 transition-all duration-500 hover:bg-white sm:px-5 md:px-6">
        <div className="-mx-3 flex items-center justify-between gap-2">
          <Link className="text-md flex-none p-3 text-xl leading-none font-extrabold" to="/">
            {data?.title}
          </Link>

          <div className="flex flex-1 gap-2">
            {links.map((link, idx) => (
              <Link
                className={
                  link.href === pathname
                    ? 'text-md rounded p-3 leading-none font-medium opacity-100'
                    : 'text-md rounded p-3 leading-none font-medium opacity-50 hover:opacity-100'
                }
                to={link.href}
                key={idx}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">{children}</div>

      <div className="p-5 text-xs text-gray-600 dark:text-gray-400">{data?.copyrightText}</div>
    </div>
  )
}
