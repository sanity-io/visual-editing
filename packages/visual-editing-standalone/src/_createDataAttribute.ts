import {createDataAttribute as createDataAttributeSource} from '@sanity/visual-editing/create-data-attribute'

type IndexTuple = [number | '', number | '']
type KeyedSegment = {_key: string}
type StudioPathLike = Array<string | number | KeyedSegment | IndexTuple> | string

/**
 * Helper.
 * @public
 */
export type WithRequired<T, K extends keyof T> = T & {[P in K]-?: T[P]}

/**
 * The metadata that can be embedded in a data attribute.
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
  perspective?: string
}

/**
 * A builder for incrementally creating a `data-sanity` attribute.
 * @public
 */
export type CreateDataAttribute<T extends CreateDataAttributeProps> = (T extends WithRequired<
  CreateDataAttributeProps,
  'id' | 'type' | 'path'
>
  ? {
      (path?: StudioPathLike): string
      toString(): string
    }
  : T extends WithRequired<CreateDataAttributeProps, 'id' | 'type'>
    ? (path: StudioPathLike) => string
    : object) & {
  scope(path: StudioPathLike): CreateDataAttribute<T & {path: StudioPathLike}>
  combine: <U extends CreateDataAttributeProps>(props: U) => CreateDataAttribute<T & U>
}

/**
 * Creates a `data-sanity` attribute from explicit document metadata.
 * @public
 */
export function createDataAttribute<T extends CreateDataAttributeProps>(
  props: T,
): CreateDataAttribute<T> {
  return createDataAttributeSource(props) as CreateDataAttribute<T>
}
