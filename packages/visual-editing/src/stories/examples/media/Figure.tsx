export function Figure(props: {
  caption?: React.ReactNode
  className?: string
  img?: React.ReactNode
}): JSX.Element {
  const {caption, className, img} = props

  return (
    <figure className={className}>
      {img}

      <figcaption className="mt-1">
        <p className="text-sm leading-tight">{caption}</p>
      </figcaption>
    </figure>
  )
}
