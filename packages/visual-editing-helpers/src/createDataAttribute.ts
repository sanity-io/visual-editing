import { studioPath, type StudioPathLike } from '@sanity/client/csm'

import { encodeSanityNodeData } from './csm/transformSanityNodeData'
import type {
  CreateDataAttribute,
  CreateDataAttributeProps,
  SanityNode,
} from './types'

/**
 * @public
 */
export function createDataAttribute(
  props: CreateDataAttributeProps,
): CreateDataAttribute {
  // Internal function for normalizing a path
  function normalizePath(path?: StudioPathLike) {
    if (!path) return []
    return typeof path === 'string' ? studioPath.fromString(path) : path
  }

  // Internal function for building a data attribute string
  function toString(props: CreateDataAttributeProps): string {
    if (!props.id)
      throw new Error('`id` is required to create a data attribute')
    if (!props.type)
      throw new Error('`type` is required to create a data attribute')
    if (!props.path || !props.path.length)
      throw new Error('`path` is required to create a data attribute')

    const attrs = {
      baseUrl: props.baseUrl || '/',
      workspace: props.workspace,
      tool: props.tool,
      type: props.type,
      id: props.id,
      path:
        typeof props.path === 'string'
          ? props.path
          : studioPath.toString(props.path),
    } satisfies SanityNode

    return encodeSanityNodeData(attrs)!
  }

  // The returned function call, calls the internal `toString` function with an optional concatenated path
  const DataAttribute: CreateDataAttribute = function (path?: StudioPathLike) {
    return toString({
      ...props,
      path: [...normalizePath(props.path), ...normalizePath(path)],
    })
  }

  // Alternative to the function call, but does not accept a path to concatenate
  DataAttribute.toString = function () {
    return toString(props)
  }

  DataAttribute.combine = function (attrs: CreateDataAttributeProps) {
    return createDataAttribute({
      ...props,
      ...attrs,
    })
  }

  DataAttribute.scope = function (path: StudioPathLike) {
    return createDataAttribute({
      ...props,
      path: [...normalizePath(props.path), ...normalizePath(path)],
    })
  }

  return DataAttribute
}
