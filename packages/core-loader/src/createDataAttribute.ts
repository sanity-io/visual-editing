import { studioPath, type StudioPathLike } from '@sanity/client/csm'
import type { SanityNode } from '@sanity/visual-editing-helpers'
import { encodeSanityNodeData } from '@sanity/visual-editing-helpers/csm'

/**
 * @public
 */
export type CreateDataAttributeStudioOptions = {
  baseUrl: string
  dataset?: string
  projectId?: string
  tool?: string
  workspace?: string
}

/**
 * @public
 */
export type CreateDataAttributeDocument = {
  id: string
  type: string
}

/**
 * @public
 */
export type CreateDataAttributeFromPath = {
  (path: StudioPathLike): string | undefined
  scope: (path: StudioPathLike) => CreateDataAttributeFromPath
}

/**
 * @public
 */
export type CreateDataAttributeFromDocument = (
  document: CreateDataAttributeDocument,
  path?: StudioPathLike,
) => CreateDataAttributeFromPath

/**
 * @internal
 */
function createScopedDataAttributeWithDocument(
  studioOptions: CreateDataAttributeStudioOptions,
  document: CreateDataAttributeDocument,
  basePath?: StudioPathLike,
): CreateDataAttributeFromPath {
  const parse = (path?: StudioPathLike) => {
    if (!path) return []
    return typeof path === 'string' ? studioPath.fromString(path) : path
  }

  const parsedBasePath = parse(basePath)

  return Object.assign(
    (path: StudioPathLike) =>
      createDataAttribute(studioOptions, document, [
        ...parsedBasePath,
        ...parse(path),
      ]),
    {
      scope: (scope: StudioPathLike) =>
        createScopedDataAttributeWithDocument(studioOptions, document, [
          ...parsedBasePath,
          ...parse(scope),
        ]),
    },
  )
}

/**
 * @public
 */
export function createDataAttribute(
  studioOptions: CreateDataAttributeStudioOptions,
): CreateDataAttributeFromDocument
export function createDataAttribute(
  studioOptions: CreateDataAttributeStudioOptions,
  document: CreateDataAttributeDocument,
): CreateDataAttributeFromPath
export function createDataAttribute(
  studioOptions: CreateDataAttributeStudioOptions,
  document: CreateDataAttributeDocument,
  path: StudioPathLike,
): string
export function createDataAttribute(
  studioOptions: CreateDataAttributeStudioOptions,
  document?: CreateDataAttributeDocument,
  path?: StudioPathLike,
): CreateDataAttributeFromDocument | CreateDataAttributeFromPath | string {
  if (!document) {
    function createDataAttributeWithStudioOptions(
      document: CreateDataAttributeDocument,
    ): CreateDataAttributeFromPath
    function createDataAttributeWithStudioOptions(
      document: CreateDataAttributeDocument,
      path: StudioPathLike,
    ): string
    // eslint-disable-next-line no-inner-declarations
    function createDataAttributeWithStudioOptions(
      document: CreateDataAttributeDocument,
      path?: StudioPathLike,
    ): CreateDataAttributeFromPath | string {
      return path
        ? createDataAttribute(studioOptions, document, path)
        : createDataAttribute(studioOptions, document)
    }

    return createDataAttributeWithStudioOptions
  }

  const createDataAttributeWithDocument = (path: StudioPathLike) => {
    const attrs = {
      baseUrl: studioOptions.baseUrl,
      workspace: studioOptions.workspace,
      tool: studioOptions.tool,
      type: document.type,
      id: document.id,
      path: typeof path === 'string' ? path : studioPath.toString(path),
    } satisfies SanityNode

    return encodeSanityNodeData(attrs)!
  }

  return path
    ? createDataAttributeWithDocument(path)
    : createScopedDataAttributeWithDocument(studioOptions, document)
}
