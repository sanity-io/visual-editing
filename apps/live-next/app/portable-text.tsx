/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */
import {PortableText, type PortableTextBlock, type PortableTextComponents} from 'next-sanity'
import type {CSSProperties} from 'react'

function getViewTransitionName(value: string | undefined) {
  return value ? `pt-${value}` : undefined
}

function style(value: string | undefined): CSSProperties {
  return {
    viewTransitionName: getViewTransitionName(value),
  }
}

const underlineStyle = {textDecoration: 'underline'}

export default function CustomPortableText({
  className,
  value,
}: {
  className?: string
  value: PortableTextBlock[]
}) {
  const components: PortableTextComponents = {
    block: {
      normal: ({children, value}) => <p style={style(value?._key)}>{children}</p>,
      blockquote: ({children, value}) => (
        <blockquote style={style(value?._key)}>{children}</blockquote>
      ),
      h1: ({children, value}) => <h1 style={style(value?._key)}>{children}</h1>,
      h2: ({children, value}) => <h2 style={style(value?._key)}>{children}</h2>,
      h3: ({children, value}) => <h3 style={style(value?._key)}>{children}</h3>,
      h4: ({children, value}) => <h4 style={style(value?._key)}>{children}</h4>,
      h5: ({children, value}) => (
        <h5 style={style(value?._key)} className="mb-2 text-sm font-semibold">
          {children}
        </h5>
      ),
      h6: ({children, value}) => (
        <h6 style={style(value?._key)} className="mb-1 text-xs font-semibold">
          {children}
        </h6>
      ),
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
    list: {
      number: ({children, value}) => <ol style={style(value?._key)}>{children}</ol>,
      bullet: ({children, value}) => <ul style={style(value?._key)}>{children}</ul>,
    },
    listItem: ({children, value}) => (
      <li key={value?._key} style={style(value?._key)}>
        {children}
      </li>
    ),
    // @TODO use a client component and `useId()` to generate a unique view transition name
    // hardBreak: () => <br />,

    // unknownType: DefaultUnknownType,
    // unknownMark: DefaultUnknownMark,
    unknownList: ({children, value}) => <ul style={style(value?._key)}>{children}</ul>,
    unknownListItem: ({children, value}) => (
      <li key={value?._key} style={style(value?._key)}>
        {children}
      </li>
    ),
    unknownBlockStyle: ({children, value}) => <p style={style(value?._key)}>{children}</p>,
  }

  return (
    <div className={['prose', className].filter(Boolean).join(' ')}>
      <PortableText components={components} value={value} />
    </div>
  )
}
