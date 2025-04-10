import type {SanityNode} from '@sanity/visual-editing-csm'

/** @public */
export type SanityKey =
  | '_createdAt'
  | '_dataset'
  | '_id'
  | '_key'
  | '_originalId'
  | '_projectId'
  | '_ref'
  | '_rev'
  | '_strengthenOnPublish'
  | '_type'
  | '_updatedAt'
  | '_weak'

/** @public */
export type SanityPrimitive = string | number | boolean | null

/** @public */
export type SourceNode<T extends Exclude<SanityPrimitive, null> = Exclude<SanityPrimitive, null>> =
  {
    $$type$$: 'sanity'
    path: string | undefined
    source: SanityNode | undefined
    value: T
  }

/** @public */
export type WrappedValue<T> = T extends string
  ? SourceNode<string>
  : T extends number
    ? SourceNode<number>
    : T extends boolean
      ? SourceNode<boolean>
      : T extends Array<unknown>
        ? Array<WrappedValue<T[number]>>
        : T extends {} // eslint-disable-line @typescript-eslint/no-empty-object-type
          ? {[P in keyof T]: P extends SanityKey ? T[P] : WrappedValue<T[P]>}
          : T extends string
            ? string
            : T extends null
              ? null
              : T extends undefined
                ? undefined
                : never

/** @public */
export type UnwrappedValue<W = WrappedValue<unknown>> =
  W extends SourceNode<string>
    ? string
    : W extends SourceNode<number>
      ? number
      : W extends SourceNode<boolean>
        ? boolean
        : W extends Array<unknown>
          ? Array<UnwrappedValue<W[number]>>
          : W extends {} // eslint-disable-line @typescript-eslint/no-empty-object-type
            ? {
                [P in keyof W]: P extends SanityKey ? W[P] : UnwrappedValue<W[P]>
              }
            : W extends string
              ? string
              : W extends null
                ? null
                : W extends undefined
                  ? undefined
                  : never

/** @public */
export interface SanityNodeContext {
  baseUrl: string
  tool?: string
  workspace?: string
}
