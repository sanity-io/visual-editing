import type {HTMLProps, ReactElement} from 'react'

import {imageUrlBuilder} from '../image'

export interface ImageProps extends Omit<
  HTMLProps<HTMLImageElement>,
  'src' | 'value' | 'width' | 'height'
> {
  value: {
    _type: 'image'
    asset?: {_type: 'reference'; _ref?: string}
  }
  width?: number
  height?: number
}

/**
 * Default framework-agnostic image renderer. Apps can override it through
 * `PageBuilderProvider` (e.g. with a `next/image` based implementation).
 */
export function Image(props: ImageProps): ReactElement | null {
  const {value, width = 800, height = 800, ...rest} = props

  if (!value?.asset?._ref) {
    return null
  }

  return (
    <img
      {...rest}
      src={imageUrlBuilder.image(value).width(width).height(height).url()}
      width={width}
      height={height}
      alt={rest.alt ?? ''}
    />
  )
}
