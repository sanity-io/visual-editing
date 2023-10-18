import { HTMLProps } from 'react'

import { imageUrlBuilder, SanityImageValue } from '@/sanity'

export function Image(
  props: { value: SanityImageValue; width?: number; height?: number } & Omit<
    HTMLProps<HTMLImageElement>,
    'src' | 'value' | 'width' | 'height'
  >,
) {
  const { value, width = 800, height = 800, ...rest } = props

  return (
    <img
      {...rest}
      src={imageUrlBuilder.image(value).width(width).height(height).url()}
      width={width}
      height={height}
    />
  )
}
