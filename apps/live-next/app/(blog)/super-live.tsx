'use client'

import {client} from '@/sanity/lib/client'
import {useEffect} from 'react'
import {revalidateSyncTags} from './actions'

export default function SuperLive() {
  useEffect(() => {
    console.log(client)
    const subscription = client.live.events().subscribe((event) => {
      if (event.type === 'message') {
        console.log('live.events() changed', event.tags)
        revalidateSyncTags(event.tags)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return null
}
