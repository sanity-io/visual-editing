'use client'

import {at, set} from '@sanity/mutate'
import {useDocuments, type OverlayComponent} from '@sanity/visual-editing'
import {useCallback, useMemo, useRef, useState, type MouseEventHandler} from 'react'

function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(fn: F, timeout: number): F {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<F>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(fn, args)
    }, timeout)
  }) as F
}

const throttle = <R, A extends any[]>(
  fn: (...args: A) => R,
  delay: number,
): [(...args: A) => R | undefined, () => void] => {
  let wait = false
  let timeout: undefined | number
  let cancelled = false

  return [
    (...args: A) => {
      if (cancelled) return undefined
      if (wait) return undefined

      const val = fn(...args)

      wait = true

      timeout = window.setTimeout(() => {
        wait = false
      }, delay)

      return val
    },
    () => {
      cancelled = true
      clearTimeout(timeout)
    },
  ]
}

export const ProductModelRotationControl: OverlayComponent = (props) => {
  const {PointerEvents, node} = props

  const {getDocument} = useDocuments()
  const doc = getDocument(node.id)

  const [isSetting, setIsSetting] = useState(false)

  const patch = useCallback(
    ({pitch, yaw}: {pitch: number; yaw: number}) => {
      doc.patch(
        () => {
          return [
            at([node.path, 'pitch'].join('.'), set(pitch)),
            at([node.path, 'yaw'].join('.'), set(yaw)),
          ]
        },
        {commit: false},
      )
    },
    [doc, node.path],
  )

  const deferredPatch = useMemo(() => throttle(patch, 200)[0], [patch])

  const deferredCommit = useMemo(() => debounce(doc.commit, 1000), [doc])

  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const width = rect.width
        const height = rect.height

        // Calculate the percentage of the mouse position inside the div
        const percentageX = Math.max(0, Math.min(100, (mouseX / width) * 100))
        const percentageY = Math.max(0, Math.min(100, (mouseY / height) * 100))

        // Ensure percentage stays between 0 and 100
        const yaw = 360 + (180 / 100) * -percentageX
        const pitch = (45 / 100) * percentageY
        deferredPatch({yaw, pitch})
        deferredCommit()
      }
    },
    [deferredCommit, deferredPatch],
  )

  const handleClick = useCallback(() => {
    console.log('COMMIT!?')
    setIsSetting(false)
    doc.commit()
  }, [doc])

  return isSetting ? (
    <PointerEvents className="h-full w-full">
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className="h-full w-full"
        onClick={handleClick}
      />
    </PointerEvents>
  ) : (
    <PointerEvents className="p-3">
      <button
        className="rounded bg-blue-500 px-2 py-1 text-sm text-white"
        onClick={() => setIsSetting(true)}
      >
        Set Rotation
      </button>
    </PointerEvents>
  )
}
