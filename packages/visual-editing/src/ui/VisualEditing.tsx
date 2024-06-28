import {Flex, Stack, Text} from '@sanity/ui'
import type {ChangeEvent, FunctionComponent} from 'react'

import type {VisualEditingOptions} from '../types'
import {Meta} from './Meta'
import {Overlays} from './Overlays'
import {Refresh} from './Refresh'
import {useChannel} from './useChannel'

export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  timeout: number,
): F {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<F>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(fn, args)
    }, timeout)
  }) as F
}

/**
 * @public
 */
export const VisualEditing: FunctionComponent<VisualEditingOptions> = (props) => {
  const {components, history, refresh, zIndex} = props
  const channel = useChannel()

  // @TODO until next-sanity changes
  const fakeComponentsBecauseOfNextSanity = [
    {
      type: 'object', // Also function?
      name: 'product', // Also function?
      path: 'model', // Also function?
      component: ({sanity, dispatch}) => {
        const onChangeRotation = (e: ChangeEvent<HTMLInputElement>) => {
          const path = [sanity.path, 'rotation', 'y'].join('.')
          dispatch({
            id: sanity.id,
            type: sanity.type!,
            patch: {
              set: {
                [path]: Number(e.target.value),
              },
            },
          })
        }
        const onChangeIntensity = (e: ChangeEvent<HTMLInputElement>) => {
          const path = [sanity.path, 'light', 'intensity'].join('.')
          dispatch({
            id: sanity.id,
            type: sanity.type!,
            patch: {
              set: {
                [path]: Number(e.target.value) / 100,
              },
            },
          })
        }
        const onChangeRotationDebounced = debounce(onChangeRotation, 200)
        const onChangeIntensityDebounced = debounce(onChangeIntensity, 200)
        return (
          <Stack padding={2} space={2}>
            <Flex gap={2}>
              <Text>Rotation</Text>
              <input
                type="range"
                id="rotation"
                name="rotation"
                min="0"
                max="360"
                onChange={onChangeRotationDebounced}
              />
            </Flex>
            <Flex gap={2}>
              <Text>Intensity</Text>
              <input
                type="range"
                id="intensity"
                name="intensity"
                min="0"
                max="100"
                onChange={onChangeIntensityDebounced}
              />
            </Flex>
          </Stack>
        )
      },
    },
  ] satisfies VisualEditingOptions['components']

  return (
    channel && (
      <>
        <Overlays
          components={components || fakeComponentsBecauseOfNextSanity}
          channel={channel}
          history={history}
          zIndex={zIndex}
        />
        <Meta channel={channel} />
        {refresh && <Refresh channel={channel} refresh={refresh} />}
      </>
    )
  )
}
