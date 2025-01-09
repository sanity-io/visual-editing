import LinkTo from '@storybook/addon-links/react'

export function Link(props: {
  children: React.ReactNode
  className?: string
  kind?: string
  story?: string
  name?: string
}): React.JSX.Element {
  const {className, kind, story, name, children} = props

  return (
    <LinkTo
      kind={kind}
      story={story}
      name={name}
      // @ts-expect-error - this is supported, but the types won't tell you
      className={className}
    >
      {children}
    </LinkTo>
  )
}
