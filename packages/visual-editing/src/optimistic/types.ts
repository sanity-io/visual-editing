/* eslint-disable @typescript-eslint/no-explicit-any */
import type {SanityDocument} from '@sanity/client'
import {type Mutation, type NodePatchList} from '@sanity/mutate'

export type Path<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}.${Path<T[K], keyof T[K]>}` | K
    : K
  : never

export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never

export type DocumentsMutate = (
  documentId: string,
  mutations: Mutation[],
  options?: {commit?: boolean | {debounce: number}},
) => void

export type DocumentsGet = <T extends Record<string, any>>(
  documentId: string,
) => OptimisticDocument<T>

export type OptimisticDocumentPatches<T extends Record<string, any> = Record<string, any>> =
  | ((context: {
      draftId: string
      publishedId: string
      /**
       * @deprecated - use `getSnapshot` instead
       */
      snapshot: SanityDocument<T> | undefined
      getSnapshot: () => Promise<SanityDocument<T> | null>
    }) => Promise<NodePatchList> | NodePatchList)
  | NodePatchList

export type OptimisticDocument<T extends Record<string, any> = Record<string, any>> = {
  /**
   * The document ID
   */
  id: string
  /**
   * Commits any locally applied mutations to the remote document
   */
  commit: () => void
  /**
   * @deprecated - use `getSnapshot` instead
   */
  get: {
    (): SanityDocument<T> | undefined
    <P extends Path<T, keyof T>>(path: P): PathValue<T, P> | undefined
  }
  /**
   * Returns a promise that resolves to the current document snapshot
   */
  getSnapshot: () => Promise<SanityDocument<T> | null>
  /**
   * Applies the given patches to the document
   */
  patch: (
    patches: OptimisticDocumentPatches<T>,
    options?: {commit?: boolean | {debounce: number}},
  ) => void
}

export type OptimisticReducerAction<T> = {
  document: T
  id: string
  originalId: string
  type: 'appear' | 'mutate' | 'disappear'
}

export type OptimisticReducer<T, U> = (state: T, action: OptimisticReducerAction<U>) => T
