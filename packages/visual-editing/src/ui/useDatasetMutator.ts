import {useEffect} from 'react'
import {createActor} from 'xstate'
import {setActor} from '../optimistic/context'
import {createSharedListener} from '../optimistic/state/createSharedListener'
import {createDatasetMutator} from '../optimistic/state/datasetMutator'
import type {VisualEditingNode} from '../types'

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
      // @ts-expect-error @todo
      input: {client: {withConfig: () => {}}, sharedListener: listener},
    })

    mutator.start()

    // Fetch features to determine if optimistic updates are supported
    const featuresFetch = new AbortController()
    // eslint-disable-next-line no-console
    console.count('useDatasetMutator send visual-editing/features')
    let retries = 0
    async function fetch() {
      return comlink!
        .fetch('visual-editing/features', undefined, {
          signal: featuresFetch.signal,
          suppressWarnings: true,
        })
        .then((data) => {
          // eslint-disable-next-line no-console
          console.log('useDatasetMutator resolved visual-editing/features', {data})
          if (data.features['optimistic']) {
            // eslint-disable-next-line no-console
            console.log('useDatasetMutator setting actor')
            setActor(mutator)
          }
        })
    }
    fetch().catch(() => {
      if (retries < 3) {
        retries++
        setTimeout(fetch, 1000 * retries)
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          '[@sanity/visual-editing] Package version mismatch detected: Please update your Sanity studio to prevent potential compatibility issues.',
        )
      }
    })

    return () => {
      // eslint-disable-next-line no-console
      console.log('useDatasetMutator cleanup')
      mutator.stop()
      featuresFetch.abort()
    }
  }, [comlink])
}
