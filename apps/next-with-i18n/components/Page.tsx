import type {PagePayload} from '@/types'
import {PortableText, type PortableTextComponents} from 'next-sanity'

export interface PageProps {
  data: PagePayload | null
}

const components: PortableTextComponents = {
  block: {
    h5: ({children}) => <h5 className="mb-2 text-sm font-semibold">{children}</h5>,
    h6: ({children}) => <h6 className="mb-1 text-xs font-semibold">{children}</h6>,
  },
  marks: {
    link: ({children, value}) => {
      return (
        <a href={value?.href} rel="noreferrer noopener">
          {children}
        </a>
      )
    },
  },
}

export function Page({data}: PageProps) {
  const {title, body} = data ?? {}

  return (
    <div className="container h-screen w-screen">
      <article className="prose p-10">
        <h1>{title}</h1>
        {Array.isArray(body) && <PortableText components={components} value={body} />}
      </article>
    </div>
  )
}
