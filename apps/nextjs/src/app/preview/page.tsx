'use client'

import { useEffect } from 'react'
import { useSanityQuery } from '../sanity.loader'

export default function PreviewPage() {
  // A real app would also call client.fetch, but here we are taking some shortcuts to faster get to an end-to-end
  // const [data] = useLiveQuery(null, /* groq */ `*[_type == "page"]`)
  const [data, loading] = useSanityQuery<any>(/* groq */ `*[_type == $type]`, {
    type: 'page',
  })

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

  return (
    <div>
      <div>
        PreviewPage
        <p>
          First type (should have an overlay, due to stega):{' '}
          <span>{(data?.[0] as any)?._type}</span>
        </p>
      </div>
      {loading && !data ? (
        <>Loading&hellip;</>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  )
}
