import {Text} from '@sanity/ui'
import React, {useMemo} from 'react'

export function DisplayUrl({displayUrl}: {displayUrl: string}) {
  const truncatedUrl = useMemo(() => {
    const url = new URL(displayUrl)

    if (url.searchParams.has('secret')) {
      url.searchParams.delete('secret')
      url.searchParams.append('secret', '***')
    }

    return `${url.origin === location.origin ? '' : url.origin}${url.pathname}${url.search}`
  }, [displayUrl])

  return (
    <Text size={0} textOverflow="ellipsis" title={displayUrl}>
      {truncatedUrl}
    </Text>
  )
}
