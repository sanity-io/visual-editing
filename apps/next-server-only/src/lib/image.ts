import createImageUrlBuilder from '@sanity/image-url'
import type { ImageLoader } from 'next/image'
import type { Image } from 'sanity'

import { dataset, projectId } from './env'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: Image) => {
  return imageBuilder?.image(source).auto('format').fit('max')
}

const imageloader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src)
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'max')
  if (url.searchParams.has('h')) {
    const originalHeight = parseInt(url.searchParams.get('h')!, 10)
    const originalWidth = parseInt(url.searchParams.get('w')!, 10)
    url.searchParams.set(
      'h',
      Math.round((originalHeight / originalWidth) * width).toString(),
    )
  }
  url.searchParams.set('w', width.toString())
  if (quality) {
    url.searchParams.set('q', quality.toString())
  }
  return url.href
}

export default imageloader
