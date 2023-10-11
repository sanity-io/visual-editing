import {
  type SanityNode,
  encodeSanityNodeData as _encodeSanityNodeData,
} from '@sanity/overlays'
import { workspaces, baseUrl } from 'apps-common/env'
import { vercelStegaCombine } from '@vercel/stega'
import { Link } from '@remix-run/react'

const { projectId, dataset, tool, workspace } = workspaces['remix']

function encodeSanityNodeData(
  node: Partial<SanityNode> & Pick<SanityNode, 'id' | 'type' | 'path'>,
) {
  return _encodeSanityNodeData({
    projectId,
    dataset,
    // @TODO temporary workaround as overlays fails to find the right workspace
    baseUrl: `${baseUrl}/${workspace}`,
    workspace,
    tool,
    ...node,
  })
}

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-10">
      <h1
        data-sanity={encodeSanityNodeData({
          id: '279d8ab4-a46b-40bc-aeb7-89cfbe013ae4',
          type: 'product',
          path: 'title',
        })}
      >
        encodeSanityNodeData
      </h1>
      <h1>
        {vercelStegaCombine('vercelStegaCombine', {
          origin: 'sanity.io',
          href: `${baseUrl}/intent/edit/id=279d8ab4-a46b-40bc-aeb7-89cfbe013ae4;path=title`,
        })}
      </h1>
      <h1
        data-sanity={encodeSanityNodeData({
          id: '279d8ab4-a46b-40bc-aeb7-89cfbe013ae4',
          // type: 'product',
          path: 'title',
        })}
      >
        encodeSanityNodeData but minimal
      </h1>
      <h1
        data-sanity={encodeSanityNodeData({
          id: '279d8ab4-a46b-40bc-aeb7-89cfbe013ae4',
          type: 'product',
          path: 'slug',
        })}
      >
        encodeSanityNodeData but slug
      </h1>
      <h1
        data-sanity={encodeSanityNodeData({
          id: '279d8ab4-a46b-40bc-aeb7-89cfbe013ae4',
          type: 'product',
          path: 'slug.current',
        })}
      >
        encodeSanityNodeData but slug.current
      </h1>
      <h1
        data-sanity={encodeSanityNodeData({
          id: '279d8ab4-a46b-40bc-aeb7-89cfbe013ae4',
          type: 'product',
          path: '',
        })}
      >
        encodeSanityNodeData without a path
      </h1>
      <h1
        data-sanity={encodeSanityNodeData({
          id: '279d8ab4-a46b-40bc-aeb7-89cfbe013ae4',
          type: 'product',
          path: 'details.ledLifespan',
        })}
      >
        encodeSanityNodeData but details.lifespan
      </h1>
      <h1
        data-sanity={encodeSanityNodeData({
          id: '1ca3ce94-688f-4f77-ac76-085b269735d6',
          type: 'brand',
          path: 'name',
          projectId: workspaces['cross-dataset-references'].projectId,
          dataset: workspaces['cross-dataset-references'].dataset,
          workspace: workspaces['cross-dataset-references'].workspace,
          tool: workspaces['cross-dataset-references'].tool,
        })}
      >
        Cross Dataset Reference
      </h1>
      <hr className="max-w-32 my-8 h-px w-full border-0 bg-slate-200 dark:bg-slate-700" />
      <Link to="/products">Products</Link>
    </div>
  )
}
