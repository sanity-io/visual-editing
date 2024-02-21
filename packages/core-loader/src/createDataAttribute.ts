import { studioPath, type StudioPathLike } from '@sanity/client/csm'
import type { SanityNode } from '@sanity/visual-editing-helpers'
import { encodeSanityNodeData } from '@sanity/visual-editing-helpers/csm'

/**
 * @public
 */
export interface CreateDataAttributeProps {
  baseUrl?: string
  dataset?: string
  id?: string
  path?: StudioPathLike
  projectId?: string
  tool?: string
  type?: string
  workspace?: string
}

/**
 * @public
 */
export type CreateDataAttribute = {
  /**
   * @public
   * Returns a string representation of the data attribute
   * @param path - An optional path to concatenate with any existing path
   */
  (path?: StudioPathLike): string
  /**
   * @public
   * Concatenate the data attribute current path with a new path
   * @param path - A path to concatenate with any existing path
   */
  scope(path: StudioPathLike): CreateDataAttribute
  /**
   * @public
   * Combines the current data attribute props with additional props
   * @param props - New props to merge with any existing props
   */
  combine(props: CreateDataAttributeProps): CreateDataAttribute
  /**
   * @public
   * Returns a string representation of the data attribute
   */
  toString(): string
}

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
