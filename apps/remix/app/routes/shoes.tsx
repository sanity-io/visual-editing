import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import {
  type SanityNode,
  encodeSanityNodeData as _encodeSanityNodeData,
} from '@sanity/overlays'
import { type ContentSourceMap, createClient } from '@sanity/preview-kit/client'
import {
  resolveMapping,
  encodeJsonPathToUriComponent,
  type PathSegment,
  parseNormalisedJsonPath,
} from '@sanity/preview-kit/csm'
import { workspaces, baseUrl, apiVersion } from 'apps-common/env'
import { shoesList, type ShoesListResult } from 'apps-common/queries'

const { projectId, dataset, tool, workspace } = workspaces['remix']
const studioUrl = `${baseUrl}/${workspace}`

function encodeSanityNodeData(
  node: Partial<SanityNode> & Pick<SanityNode, 'id' | 'type' | 'path'>,
) {
  return _encodeSanityNodeData({
    // baseUrl,
    // @TODO temporary workaround as overlays fails to find the right workspace
    baseUrl: studioUrl,
    workspace,
    tool,
    ...node,
    projectId: node?.projectId || projectId,
    dataset: node?.dataset || dataset,
  })
}

export async function loader() {
  const client = createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion,
    logger: console,
    encodeSourceMap: true,
    /*
    // @TODO fix cross dataset reference links
    encodeSourceMapAtPath: (props) => {
      if (
        // @ts-expect-error - @sanity/client lack typings
        props.sourceDocument._projectId &&
        // @ts-expect-error - @sanity/client lack typings
        props.sourceDocument._projectId !== projectId
      ) {
        return false
      }
      if (
        // @ts-expect-error - @sanity/client lack typings
        props.sourceDocument._dataset &&
        // @ts-expect-error - @sanity/client lack typings
        props.sourceDocument._dataset !== dataset
      ) {
        return false
      }

      return props.filterDefault(props)
    },
    // */
    studioUrl,
  })
  const { result, resultSourceMap } = await client.fetch<ShoesListResult>(
    shoesList,
    {},
    { filterResponse: false },
  )

  return json({
    vercelEnv: process.env.VERCEL_ENV || 'development',
    result,
    resultSourceMap,
  })
}

function resolveSanityNodeFromResultSourceMapPath(
  resultPath: PathSegment[],
  csm: ContentSourceMap,
): Partial<SanityNode> | null {
  const resolveMappingResult = resolveMapping(resultPath, csm)

  if (!resolveMappingResult) {
    console.warn('resolveMappingResult not found', {
      resultPath,
      csm,
      resolveMappingResult,
    })
    return null
  }

  const [mapping, tmpDebug, pathSuffix] = resolveMappingResult
  if (mapping.type !== 'value') {
    console.warn('mapping.type !== value', {
      resultPath,
      csm,
      resolveMappingResult,
      mapping,
      pathSuffix,
      tmpDebug,
    })
    return null
  }

  if (mapping.source.type !== 'documentValue') {
    console.warn('mapping.source.type !== documentValue', {
      resultPath,
      csm,
      resolveMappingResult,
      mapping,
      pathSuffix,
      tmpDebug,
    })
    return null
  }

  const sourceDocument =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    csm.documents[mapping.source.document!]
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sourcePath = csm.paths[mapping.source.path]

  if (sourceDocument._projectId) {
    console.log(sourceDocument._dataset)
  }

  return {
    projectId: sourceDocument._projectId,
    dataset: sourceDocument._dataset,
    type: sourceDocument._type,
    id: sourceDocument._id,
    path: encodeJsonPathToUriComponent(
      parseNormalisedJsonPath(sourcePath + pathSuffix),
    ),
  }
}

function encodeSanityNodeFromResultPath(
  resultPath: PathSegment[],
  csm: ContentSourceMap,
) {
  const resolvedNode = resolveSanityNodeFromResultSourceMapPath(resultPath, csm)
  return encodeSanityNodeData(resolvedNode! as any)
}

export default function ProductsRoute() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-2 py-10">
      {data.result.map((product, i) => {
        return (
          <article
            key={product?.slug?.current || i}
            className="block rounded bg-slate-50 px-2 py-4"
            data-sanity={encodeSanityNodeFromResultPath(
              [i, 'slug'],
              data.resultSourceMap!,
            )}
          >
            <h1
              data-sanity={encodeSanityNodeFromResultPath(
                [i, 'title'],
                data.resultSourceMap!,
              )}
            >
              {product.title}
            </h1>
            <p
              className="flex items-center gap-2 rounded bg-slate-100 px-2 py-1"
              data-sanity={encodeSanityNodeFromResultPath(
                [i, 'brand', 'name'],
                data.resultSourceMap!,
              )}
            >
              <img
                src={
                  product?.brand?.logo?.url ||
                  'https://source.unsplash.com/featured/?shoes'
                }
                width={64}
                height={64}
                data-sanity={encodeSanityNodeFromResultPath(
                  [i, 'brand', 'logo', 'alt'],
                  data.resultSourceMap!,
                )}
                alt={product?.brand?.logo?.alt || ''}
              />
              <span>{product?.brand?.name || 'Untitled brand'}</span>
            </p>
            <img
              src={
                product?.media?.url ||
                'https://source.unsplash.com/featured/?shoes'
              }
              width={200}
              height={200}
              data-sanity={encodeSanityNodeFromResultPath(
                // @TODO fun side-effect, it opens the sanity.imageAsset
                // [i, 'media', 'url'],
                [i, 'media', 'alt'],
                data.resultSourceMap!,
              )}
              alt={product?.media?.alt || ''}
            />
            <p
              data-sanity={encodeSanityNodeFromResultPath(
                [i, 'price'],
                data.resultSourceMap!,
              )}
            >
              {product?.price}
            </p>
          </article>
        )
      })}
    </div>
  )
}
