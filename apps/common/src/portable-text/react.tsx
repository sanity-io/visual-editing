'use client'

import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import { SanityImage } from 'sanity-image'

export default function CustomPortableText({
  className,
  projectId,
  dataset,
  value,
}: {
  className?: string
  projectId: string
  dataset: string
  value: PortableTextBlock[]
}): JSX.Element {
  const components: PortableTextComponents = {
    block: {
      h5: ({ children }) => (
        <h5 className="mb-2 text-sm font-semibold">{children}</h5>
      ),
      h6: ({ children }) => (
        <h6 className="mb-1 text-xs font-semibold">{children}</h6>
      ),
    },
    marks: {
      link: ({ children, value }) => {
        return (
          <a href={value?.href} rel="noreferrer noopener">
            {children}
          </a>
        )
      },
    },
    types: {
      image: ({
        value,
      }: {
        value: { asset: any; hotspot: any; crop: any; alt?: string }
      }) => {
        if (!value?.asset?._ref) return null
        return (
          <SanityImage
            projectId={projectId}
            dataset={dataset}
            id={value.asset._ref}
            hotspot={value.hotspot}
            crop={value.crop}
            alt={value.alt || ''}
          />
        )
      },
    },
  }

  return (
    <div className={['prose', className].filter(Boolean).join(' ')}>
      <PortableText components={components} value={value} />
    </div>
  )
}
