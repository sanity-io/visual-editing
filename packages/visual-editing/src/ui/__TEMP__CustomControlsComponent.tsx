import {set} from '@sanity/mutate'
import {Flex, Stack, Text} from '@sanity/ui'
import {useMemo, type ChangeEvent} from 'react'

import type {VisualEditingOverlayComponent} from '../types'

function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(fn: F, timeout: number): F {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<F>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(fn, args)
    }, timeout)
  }) as F
}

export const CustomControlsComponent: VisualEditingOverlayComponent<{
  rotation?: number
  lightIntensity?: number
}> = (props) => {
  const {commit, mutate, node, value} = props

  const rotation = value?.rotation || 180
  const intensity = value?.lightIntensity || 0.5

  const commitDebounced = useMemo(() => debounce(commit, 200), [commit])

  const onChangeRotation = (e: ChangeEvent<HTMLInputElement>) => {
    const patch = set(Number(e.target.value))
    mutate(patch, {path: [node.path, 'rotation']})
    commitDebounced()
  }
  const onChangeIntensity = (e: ChangeEvent<HTMLInputElement>) => {
    const patch = set(Number(e.target.value))
    mutate(patch, {path: [node.path, 'lightIntensity']})
    commitDebounced()
  }

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
          onChange={onChangeRotation}
          defaultValue={rotation}
        />
      </Flex>
      <Flex gap={2}>
        <Text>Intensity</Text>
        <input
          type="range"
          id="intensity"
          name="intensity"
          min="0"
          max="1"
          step="0.01"
          onChange={onChangeIntensity}
          defaultValue={intensity}
        />
      </Flex>
    </Stack>
  )
}
