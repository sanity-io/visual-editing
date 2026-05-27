/* eslint-disable @typescript-eslint/no-empty-function */
import type {SanityClient} from '@sanity/client'
import type {createSharedListener as createMutateSharedListener} from '@sanity/mutate/_unstable_machine'
import {useEffect} from 'react'
import {createActor} from 'xstate'

import type {VisualEditingNode} from '../types'

import {setActor} from '../optimistic/context'
import {createSharedListener} from '../optimistic/state/createSharedListener'
import {createDatasetMutator} from '../optimistic/state/datasetMutator'

/**
 * Hook for maintaining a channel between overlays and the presentation tool
 * @internal
 */
export function useDatasetMutator(comlink: VisualEditingNode | undefined): void {
  useEffect(() => {
    if (!comlink) return
    const listener = createSharedListener(comlink)
    const datasetMutator = createDatasetMutator(comlink)
    const mutator = createActor(datasetMutator, {
      input: {
        client: {withConfig: () => {}} as unknown as SanityClient,
        sharedListener: listener as unknown as ReturnType<typeof createMutateSharedListener>,
      },
    })

    mutator.start()

    // Fetch features to determine if optimistic updates are supported
    const featuresFetch = new AbortController()
    comlink
      .fetch('visual-editing/features', undefined, {
        signal: featuresFetch.signal,
        suppressWarnings: true,
      })
      .then((data) => {
        if (data.features['optimistic']) {
          setActor(mutator)
        }
      })
      .catch(() => {
        // eslint-disable-next-line no-console
        console.warn(
          '[@sanity/visual-editing] Package version mismatch detected: Please update your Sanity studio to prevent potential compatibility issues.',
        )
      })

    return () => {
      mutator.stop()
      featuresFetch.abort()
    }
  }, [comlink])
}
