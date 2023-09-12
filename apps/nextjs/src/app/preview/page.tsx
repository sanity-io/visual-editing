'use client'

import { useEffect } from 'react'

export default function PreviewPage() {
  useEffect(() => {
    parent.postMessage(
      {
        type: 'edit',
        path: '...',
        sanity: true,
      },
      location.origin,
    )
  }, [])

  return <div>PreviewPage</div>
}
