import {
  PortableText,
  PortableTextBlockComponent,
  PortableTextComponents,
  PortableTextTypeComponent,
} from '@portabletext/react'

export function SimpleContent(props: { value: any[] }) {
  const { value } = props

  return <PortableText value={value} components={components} />
}

const Block: PortableTextBlockComponent = (props) => {
  const { children } = props

  return <p>{children}</p>
}

const Span: PortableTextTypeComponent = (props) => {
  return props.value.text.value
  // return <sanity.span>{props.value.text}</sanity.span>
}

const components: Partial<PortableTextComponents> = {
  block: Block,
  types: {
    span: Span,
  },
}
