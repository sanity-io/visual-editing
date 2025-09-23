'use client'

import CustomPortableText from '@/app/portable-text'
import {useIsPresentationTool, usePresentationQuery} from '@sanity/next-loader/hooks'
import {defineQuery, type PortableTextBlock} from 'next-sanity'
import {sanityFetch} from '@/sanity/lib/live'

interface Props extends React.ComponentProps<typeof CustomPortableText> {
  id: string
}

console.log({sanityFetch})

const OPTIMISTIC_POST_CONTENT_QUERY = defineQuery(`*[_id == $id && _type == "post"][0].content`)

/**
 * This component is a client component that should always be loaded
 * with next/dynamic, and a `await draftMode().isEnabled` check,
 * it should never be rendered outside of draft mode.
 * If in draft mode but outside of Presentation Tool, it will add a little bit to the browser bundlesize but otherwise not affect performance.
 */
export default function OptimisticPostContent(props: Props) {
  const {id, ...rest} = props

  /**
   * If Presentation Tool is detected, we'll use the optimistic query to render the content with low latency.
   */
  const isPresentationTool = useIsPresentationTool()
  const optimistic = usePresentationQuery({query: OPTIMISTIC_POST_CONTENT_QUERY, params: {id}})
  if (isPresentationTool === true && Array.isArray(optimistic.data)) {
    return <CustomPortableText {...rest} value={optimistic.data as PortableTextBlock[]} />
  }

  return <CustomPortableText {...rest} />
}
