import {Image as NextImage} from 'next-sanity/image'
import {HTMLProps} from 'react'

import {imageUrlBuilder} from '@/sanity/image'

export function Image(
  props: {
    value: {
      _type: 'image'
      asset?: {_type: 'reference'; _ref?: string}
    }
    width?: number
    height?: number
  } & Omit<HTMLProps<HTMLImageElement>, 'src' | 'value' | 'width' | 'height'>,
) {
  const {value, width = 800, height = 800, ...rest} = props

  if (!value?.asset?._ref) {
    return null
  }

  return (
    // @ts-expect-error - NextImage is not typed correctly
    <NextImage
      {...rest}
      src={imageUrlBuilder.image(value).width(width).height(height).url()}
      width={width}
      height={height}
      alt=""
    />
  )
}
