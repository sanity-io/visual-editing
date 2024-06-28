import type {StudioPathLike} from '@sanity/client/csm'

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
