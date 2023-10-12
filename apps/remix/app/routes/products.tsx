import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
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
import { productsList } from 'apps-common/queries'

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
  const { result, resultSourceMap } = await client.fetch<any[]>(
    productsList,
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
      {data.result.map((product: any, i) => {
        return (
          <article
            key={product.slug.current || i}
            className="rounded bg-slate-50 px-2 py-4"
            data-sanity={encodeSanityNodeFromResultPath(
              [i, 'slug'],
              data.resultSourceMap!,
            )}
          >
            <h1>{product.title}</h1>
            <p
              className="flex items-center gap-2 rounded bg-slate-100 px-2 py-1"
              data-sanity={encodeSanityNodeFromResultPath(
                [i, 'brand', 'name'],
                data.resultSourceMap!,
              )}
            >
              <img
                src={product.brand.logo.url}
                width={64}
                height={64}
                data-sanity={encodeSanityNodeFromResultPath(
                  [i, 'brand', 'logo', 'alt'],
                  data.resultSourceMap!,
                )}
                alt={product.brand.logo.alt || ''}
              />
              {product.brand.name}
              <img
                src={product.brand.logo.url}
                width={64}
                height={64}
                data-sanity={encodeSanityNodeFromResultPath(
                  [i, 'brand', 'logo', 'url'],
                  data.resultSourceMap!,
                )}
                alt=""
              />
            </p>
            <img
              src={product.media.url}
              width={200}
              height={200}
              data-sanity={encodeSanityNodeFromResultPath(
                // @TODO fun side-effect, it opens the sanity.imageAsset
                // [i, 'media', 'url'],
                [i, 'media', 'alt'],
                data.resultSourceMap!,
              )}
              alt={product.media.alt || ''}
            />
          </article>
        )
      })}
      <hr className="max-w-32 my-8 h-px w-full border-0 bg-slate-200 dark:bg-slate-700" />
      <Link to="/">Debug</Link>
      <span className="fixed bottom-1 left-1 block rounded bg-slate-900 px-2 py-1 text-slate-100">
        {data.vercelEnv}
      </span>
    </div>
  )
}
