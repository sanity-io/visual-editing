import {useEffect, useState} from 'react'
import {createActor} from 'xstate'
import {emptyActor, setActor, type MutatorActor} from '../optimistic/context'
import {createSharedListener} from '../optimistic/state/createSharedListener'
import {createDatasetMutator} from '../optimistic/state/datasetMutator'
import type {VisualEditingNode} from '../types'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useDatasetMutator(
  comlink: VisualEditingNode | undefined,
): MutatorActor | undefined {
  const [mutator, setMutator] = useState<MutatorActor>()

  useEffect(() => {
    if (!comlink) return
    const listener = createSharedListener(comlink)
    const datasetMutator = createDatasetMutator(comlink)
    const mutator = createActor(datasetMutator, {
      // @ts-expect-error @todo
      input: {client: {withConfig: () => {}}, sharedListener: listener},
    })

    setMutator(mutator)
    mutator.start()
    // Optimistically set the mutator
    setActor(mutator)

    return () => {
      mutator.stop()
      setMutator(undefined)
    }
  }, [comlink])

  useEffect(() => {
    if (!comlink || !mutator) return
    // Fetch features to determine if optimistic updates are supported
    const featuresFetch = new AbortController()
    const unsub = comlink.onStatus(() => {
      comlink
        .fetch('visual-editing/features', undefined, {
          signal: featuresFetch.signal,
          suppressWarnings: true,
        })
        .then((data) => {
          if (featuresFetch.signal.aborted) return
          if (!data.features['optimistic']) {
            setActor(emptyActor)
          }
        })
        .catch(() => {
          if (featuresFetch.signal.aborted) return
          setActor(emptyActor)
          // eslint-disable-next-line no-console
          console.warn(
            '[@sanity/visual-editing] Package version mismatch detected: Please update your Sanity studio to prevent potential compatibility issues.',
          )
        })
    }, 'connected')

    return () => {
      featuresFetch.abort()
      unsub()
    }
  }, [mutator, comlink])

  return mutator
}
