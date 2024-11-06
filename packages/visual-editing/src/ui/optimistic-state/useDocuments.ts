/* eslint-disable @typescript-eslint/no-explicit-any */
import type {SanityDocument} from '@sanity/client'
import {createIfNotExists, patch, type Mutation, type NodePatchList} from '@sanity/mutate'
import {get as getAtPath} from '@sanity/util/paths'
import {useCallback} from 'react'
import {getDraftId, getPublishedId} from '../../util/documents'
import type {MutatorActor} from './context'
import {isEmptyActor} from './context'
import {useOptimisticActor} from './useOptimisticActor'

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

export type OptimisticDocument<T extends Record<string, any> = Record<string, any>> = {
  id: string
  commit: () => void
  get: {
    (): SanityDocument<T> | undefined
    <P extends Path<T, keyof T>>(path: P): PathValue<T, P> | undefined
  }
  patch: (
    patches:
      | ((context: {
          draftId: string
          publishedId: string
          snapshot: SanityDocument<T>
        }) => NodePatchList)
      | NodePatchList,
    options?: {commit?: boolean | {debounce: number}},
  ) => void
}

function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(fn: F, timeout: number): F {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<F>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(fn, args)
    }, timeout)
  }) as F
}

function getDocumentsAndSnapshot<T extends Record<string, any>>(id: string, actor: MutatorActor) {
  const inFrame = window.self !== window.top || window.opener

  if (isEmptyActor(actor) || !inFrame) {
    throw new Error('The `useDocuments` hook cannot be used in this context')
  }

  const draftId = getDraftId(id)
  const publishedId = getPublishedId(id)
  const documents = actor.getSnapshot().context?.documents

  const draftDoc = documents?.[draftId]
  const publishedDoc = documents?.[publishedId]

  if (!draftDoc) {
    throw new Error(`Document "${id}" not found`)
  }

  // Get the snapshot from the draft document if it exists, otherwise fall
  // back to the published document
  const snapshot = (draftDoc?.getSnapshot().context?.local ||
    publishedDoc?.getSnapshot().context?.local) as unknown as SanityDocument<T> | undefined

  if (!snapshot) {
    throw new Error(`Snapshot for document "${id}" not found`)
  }

  return {draftId, publishedId, draftDoc, publishedDoc, snapshot}
}

function createDocumentCommit<T extends Record<string, any>>(id: string, actor: MutatorActor) {
  return (): void => {
    const {draftDoc} = getDocumentsAndSnapshot<T>(id, actor)
    draftDoc.send({type: 'submit'})
  }
}

function createDocumentGet<T extends Record<string, any>>(id: string, actor: MutatorActor) {
  return <P extends Path<T, keyof T>>(
    path?: P,
  ): PathValue<T, P> | SanityDocument<T> | undefined => {
    const {snapshot} = getDocumentsAndSnapshot<T>(id, actor)

    return path
      ? (getAtPath(snapshot, path) as PathValue<T, P>)
      : (snapshot as unknown as SanityDocument<T>)
  }
}

function createDocumentPatch<T extends Record<string, any>>(id: string, actor: MutatorActor) {
  return (
    patches:
      | ((context: {
          draftId: string
          publishedId: string
          snapshot: SanityDocument<T>
        }) => NodePatchList)
      | NodePatchList,
    options?: {commit?: boolean | {debounce: number}},
  ): void => {
    const {draftDoc, draftId, publishedId, snapshot} = getDocumentsAndSnapshot<T>(id, actor)

    const {commit = true} = options || {}

    const context = {
      draftId,
      publishedId,
      snapshot,
    }

    const resolvedPatches = typeof patches === 'function' ? patches(context) : patches

    draftDoc.send({
      type: 'mutate',
      mutations: [
        // Attempt to create the draft document, it might not exist if the
        // snapshot was from the published document
        createIfNotExists({...snapshot, _id: draftId}),
        // Patch the draft document with the resolved patches
        patch(draftId, resolvedPatches),
      ],
    })

    if (commit) {
      if (typeof commit === 'object' && 'debounce' in commit) {
        const debouncedCommit = debounce(() => draftDoc.send({type: 'submit'}), commit.debounce)
        debouncedCommit()
      } else {
        draftDoc.send({type: 'submit'})
      }
    }
  }
}

export function useDocuments(): {
  getDocument: DocumentsGet
  mutateDocument: DocumentsMutate
} {
  const actor = useOptimisticActor() as MutatorActor

  const getDocument: DocumentsGet = useCallback(
    <T extends Record<string, any>>(documentId: string) => {
      return {
        id: documentId,
        commit: createDocumentCommit(documentId, actor),
        get: createDocumentGet(documentId, actor),
        patch: createDocumentPatch<T>(documentId, actor),
      }
    },
    [actor],
  )

  const mutateDocument: DocumentsMutate = useCallback(
    (id, mutations, options) => {
      const {draftDoc} = getDocumentsAndSnapshot(id, actor)
      const {commit = true} = options || {}

      draftDoc.send({
        type: 'mutate',
        mutations: mutations,
      })

      if (commit) {
        if (typeof commit === 'object' && 'debounce' in commit) {
          const debouncedCommit = debounce(() => draftDoc.send({type: 'submit'}), commit.debounce)
          debouncedCommit()
        } else {
          draftDoc.send({type: 'submit'})
        }
      }
    },
    [actor],
  )

  return {getDocument, mutateDocument}
}
