import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import {
  type SanityNode,
  encodeSanityNodeData as _encodeSanityNodeData,
} from '@sanity/overlays'
import { type ContentSourceMap } from '@sanity/preview-kit/client'
import {
  resolveMapping,
  encodeJsonPathToUriComponent,
  type PathSegment,
  parseNormalisedJsonPath,
} from '@sanity/preview-kit/csm'
import { workspaces, baseUrl } from 'apps-common/env'
import { formatCurrency } from 'apps-common/utils'
import { shoesList, type ShoesListResult } from 'apps-common/queries'
import { getClient, urlFor, urlForCrossDatasetReference } from '~/utils'

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
  const client = getClient()
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
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h1 className="sr-only">Products</h1>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {data.result.map((product, i) => (
            <Link
              key={product.slug.current}
              to={`/shoes/${product.slug.current}`}
              data-sanity={encodeSanityNodeFromResultPath(
                [i, 'slug'],
                data.resultSourceMap!,
              )}
              className="group relative"
            >
              <div className="aspect-h-1 aspect-w-1 xl:aspect-h-8 xl:aspect-w-7 w-full overflow-hidden rounded-lg bg-gray-200">
                <img
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                  src={
                    product.media?.asset
                      ? urlFor(product.media).height(1280).width(1280).url()
                      : 'https://source.unsplash.com/featured/?shoes'
                  }
                  width={1280}
                  height={1280}
                  data-sanity={
                    encodeSanityNodeFromResultPath(
                      [i, 'media', 'alt'],
                      data.resultSourceMap!,
                    ) ||
                    encodeSanityNodeFromResultPath(
                      [i, 'media', 'asset'],
                      data.resultSourceMap!,
                    ) ||
                    encodeSanityNodeFromResultPath(
                      [i, 'media'],
                      data.resultSourceMap!,
                    )
                  }
                  alt={product.media?.alt || ''}
                />
              </div>
              <h2
                className="mb-8 mt-4 text-sm text-gray-700"
                data-sanity={encodeSanityNodeFromResultPath(
                  [i, 'title'],
                  data.resultSourceMap!,
                )}
                style={{ ['textWrap' as any]: 'balance' }}
              >
                {product.title}
              </h2>
              <p
                className="absolute bottom-0 left-0 mt-1 text-lg font-medium text-gray-900"
                data-sanity={encodeSanityNodeFromResultPath(
                  [i, 'price'],
                  data.resultSourceMap!,
                )}
              >
                {product.price ? formatCurrency(product.price) : 'FREE'}
              </p>
              {product.brand && (
                <div className="absolute bottom-0.5 right-0 flex items-center gap-x-2">
                  <img
                    className="h-6 w-6 rounded-full bg-gray-50"
                    src={
                      product.brand?.logo?.asset
                        ? urlForCrossDatasetReference(product.brand.logo)
                            .height(48)
                            .width(48)
                            .url()
                        : 'https://source.unsplash.com/featured/?brand'
                    }
                    width={24}
                    height={24}
                    data-sanity={encodeSanityNodeFromResultPath(
                      [i, 'brand', 'logo', 'alt'],
                      data.resultSourceMap!,
                    )}
                    alt={product.brand?.logo?.alt || ''}
                  />
                  <span className="font-bold text-gray-600">
                    {product.brand.name}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
