import type { V2_MetaFunction } from '@remix-run/node'
import { encodeSanityNodeData } from '@sanity/overlays'
import { projectId, datasets } from 'apps-common/env'

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1
        data-sanity={encodeSanityNodeData({
          projectId: projectId,
          dataset: datasets.development,
          id: '279d8ab4-a46b-40bc-aeb7-89cfbe013ae4',
          type: 'product',
          path: 'title',
          baseUrl: 'http://localhost:3333',
          workspace: 'remix',
          tool: 'composer',
        })}
      >
        Open product
      </h1>
    </div>
  )
}
