import {studioPath, type StudioPathLike} from '@sanity/client/csm'
import type {SanityNode} from '@sanity/visual-editing-types'
import {encodeSanityNodeData} from './encodeSanityNodeData'

/**
 * Helper
 * @internal
 */
export type WithRequired<T, K extends keyof T> = T & {[P in K]-?: T[P]}

/**
 * The metadata that can be embedded in a data attribute.
 * All values are marked optional in the base type as they can be provided incrementally using the `createDataAttribute` function.
 * @public
 */
export interface CreateDataAttributeProps {
  /** The studio base URL, optional */
  baseUrl?: string
  /** The dataset, optional */
  dataset?: string
  /** The document ID, required */
  id?: string
  /** The field path, required */
  path?: StudioPathLike
  /** The project ID, optional */
  projectId?: string
  /** The studio tool name, optional */
  tool?: string
  /** The document type, required */
  type?: string
  /** The studio workspace, optional */
  workspace?: string
}

/**
 * @public
 */
export type CreateDataAttribute<T extends CreateDataAttributeProps> = (T extends WithRequired<
  CreateDataAttributeProps,
  'id' | 'type' | 'path'
>
  ? {
      /**
       * Returns a string representation of the data attribute
       * @param path - An optional path to concatenate with any existing path
       * @public
       */
      (path?: StudioPathLike): string
      /**
       * Returns a string representation of the data attribute
       * @public
       */
      toString(): string
    }
  : T extends WithRequired<CreateDataAttributeProps, 'id' | 'type'>
    ? /**
       * Returns a string representation of the data attribute
       * @param path - An optional path to concatenate with any existing path
       * @public
       */
      (path: StudioPathLike) => string
    : object) & {
  /**
   * Concatenate the current path with a new path
   * @param path - A path to concatenate with any existing path
   * @public
   */
  scope(path: StudioPathLike): CreateDataAttribute<T & {path: StudioPathLike}>
  /**
   * Combines the current props with additional props
   * @param props - New props to merge with any existing props
   * @public
   */
  combine: <U extends CreateDataAttributeProps>(props: U) => CreateDataAttribute<T & U>
}

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
