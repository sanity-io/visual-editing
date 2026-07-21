import {
  PortableText,
  type PortableTextBlockComponent,
  type PortableTextComponents,
  type PortableTextTypeComponent,
} from '@portabletext/react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SimpleContent(props: {value: any[]}) {
  const {value} = props

  return <PortableText value={value} components={components} />
}

const Block: PortableTextBlockComponent = (props) => {
  const {children} = props

  return <p>{children}</p>
}

const Span: PortableTextTypeComponent = (props) => {
  return props.value.text.value
}

const components: Partial<PortableTextComponents> = {
  block: Block,
  types: {
    span: Span,
  },
}
