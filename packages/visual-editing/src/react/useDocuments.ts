/* eslint-disable @typescript-eslint/no-explicit-any */
import type {SanityDocument} from '@sanity/client'
import {getDraftId, getPublishedId} from '@sanity/client/csm'
import {createIfNotExists, patch} from '@sanity/mutate'
import {isMaybePreviewIframe, isMaybePreviewWindow} from '@sanity/presentation-comlink'
import {get as getAtPath} from '@sanity/util/paths'
import {useCallback} from 'react'
import {isEmptyActor, type MutatorActor} from '../optimistic/context'
import type {
  DocumentsGet,
  DocumentsMutate,
  OptimisticDocumentPatches,
  Path,
  PathValue,
} from '../optimistic/types'
import {useOptimisticActor} from './useOptimisticActor'

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
  const inFrame = isMaybePreviewIframe()
  const inPopUp = isMaybePreviewWindow()

  if (isEmptyActor(actor) || (!inFrame && !inPopUp)) {
    throw new Error('The `useDocuments` hook cannot be used in this context')
  }

  const draftId = getDraftId(id)
  const publishedId = getPublishedId(id)
  const documents = actor.getSnapshot().context?.documents

  const draftDoc = documents?.[draftId]
  const publishedDoc = documents?.[publishedId]
  const doc = draftDoc || publishedDoc

  if (!doc) {
    throw new Error(`Document "${id}" not found`)
  }

  // Helper to get the snapshot from the draft document if it exists, otherwise
  // fall back to the published document
  const getDocumentSnapshot = () =>
    (draftDoc.getSnapshot().context?.local || publishedDoc.getSnapshot().context?.local) as
      | SanityDocument<T>
      | null
      | undefined

  const snapshot = getDocumentSnapshot()
  const snapshotPromise = new Promise<SanityDocument<T> | null>((resolve) => {
    if (snapshot) {
      resolve(snapshot)
    } else {
      const subscriber = doc.on('ready', (event) => {
        // Assert type here as the original document mutator machine doesn't
        // emit a 'ready' event. We provide a custom action to emit it in this
        // package's internal `createDatasetMutator` function. <3 xstate.
        const {snapshot} = event as unknown as {snapshot: SanityDocument<T> | null | undefined}
        resolve(snapshot || null)
        subscriber.unsubscribe()
      })
    }
  })

  const getSnapshot = () => snapshotPromise

  return {
    draftDoc,
    draftId,
    getSnapshot,
    publishedDoc,
    publishedId,
    /**
     * @deprecated - use `getSnapshot` instead
     */
    get snapshot() {
      // Maintain original error throwing behaviour, to avoid breaking changes
      if (!snapshot) {
        throw new Error(`Snapshot for document "${id}" not found`)
      }
      return snapshot
    },
  }
}

function createDocumentCommit<T extends Record<string, any>>(id: string, actor: MutatorActor) {
  return (): void => {
    const {draftDoc} = getDocumentsAndSnapshot<T>(id, actor)
    draftDoc.send({type: 'submit'})
  }
}

/**
 * @deprecated - superseded by `createDocumentGetSnapshot`
 */
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

function createDocumentGetSnapshot<T extends Record<string, any>>(
  id: string,
  actor: MutatorActor,
): () => Promise<SanityDocument<T> | null> {
  const {getSnapshot} = getDocumentsAndSnapshot<T>(id, actor)
  return getSnapshot
}

function createDocumentPatch<T extends Record<string, any>>(id: string, actor: MutatorActor) {
  return async (
    patches: OptimisticDocumentPatches<T>,
    options?: {commit?: boolean | {debounce: number}},
  ): Promise<void> => {
    // Destructure the function result in two steps as we need access to the
    // `result.snapshot` property in the getter, but don't want to execute the
    // getter prematurely as it may throw
    const result = getDocumentsAndSnapshot<T>(id, actor)
    const {draftDoc, draftId, getSnapshot, publishedId} = result

    const {commit = true} = options || {}

    const context = {
      draftId,
      publishedId,
      /**
       * @deprecated - use `getSnapshot` instead
       */
      get snapshot() {
        return result.snapshot
      },
      getSnapshot,
    }

    const resolvedPatches = await (typeof patches === 'function' ? patches(context) : patches)

    const _snapshot = await getSnapshot()

    if (!_snapshot) {
      throw new Error(`Snapshot for document "${id}" not found`)
    }

    draftDoc.send({
      type: 'mutate',
      mutations: [
        // Attempt to create the draft document, it might not exist if the
        // snapshot was from the published document
        createIfNotExists({..._snapshot, _id: draftId}),
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Type instantiation is excessively deep and possibly infinite.
        get: createDocumentGet(documentId, actor),
        getSnapshot: createDocumentGetSnapshot<T>(documentId, actor),
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
