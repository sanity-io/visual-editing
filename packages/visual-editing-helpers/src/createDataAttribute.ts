import {studioPath, type StudioPathLike} from '@sanity/client/csm'
import {encodeSanityNodeData} from './csm/transformSanityNodeData'
import type {CreateDataAttribute, CreateDataAttributeProps, SanityNode} from './types'

/**
 * A helper function for creating `data-sanity` attributes by explicitly providing metadata.
 * @returns An object with methods for incrementally adding and scoping metadata, and for generating a data attribute string.
 * @public
 */
export function createDataAttribute<T extends CreateDataAttributeProps>(
  props: T,
): CreateDataAttribute<T> {
  // Internal function for normalizing a path
  function normalizePath(path?: StudioPathLike) {
    if (!path) return []
    return typeof path === 'string' ? studioPath.fromString(path) : path
  }

  // Internal function for building a data attribute string
  function toString(props: CreateDataAttributeProps): string {
    if (!props.id) throw new Error('`id` is required to create a data attribute')
    if (!props.type) throw new Error('`type` is required to create a data attribute')
    if (!props.path || !props.path.length)
      throw new Error('`path` is required to create a data attribute')

    const attrs = {
      baseUrl: props.baseUrl || '/',
      workspace: props.workspace,
      tool: props.tool,
      type: props.type,
      id: props.id,
      path: typeof props.path === 'string' ? props.path : studioPath.toString(props.path),
    } satisfies SanityNode

    return encodeSanityNodeData(attrs)!
  }

  // The returned function call, calls the internal `toString` function with an optional concatenated path
  const DataAttribute = (path?: StudioPathLike): string => {
    return toString({
      ...props,
      path: [...normalizePath(props.path), ...normalizePath(path)],
    })
  }

  // Alternative to the function call, but does not accept a path to concatenate
  DataAttribute.toString = function () {
    return toString(props)
  }

  DataAttribute.combine = function <U extends CreateDataAttributeProps>(attrs: U) {
    return createDataAttribute<T & U>({
      ...props,
      ...attrs,
    })
  }

  DataAttribute.scope = function (path: StudioPathLike) {
    return createDataAttribute<T & {path: StudioPathLike}>({
      ...props,
      path: [...normalizePath(props.path), ...normalizePath(path)],
    })
  }

  return DataAttribute as CreateDataAttribute<T>
}
