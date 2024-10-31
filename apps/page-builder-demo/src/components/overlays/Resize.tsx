import {at, set} from '@sanity/mutate'
import {get} from '@sanity/util/paths'
import {useDocuments, type OverlayComponent} from '@sanity/visual-editing'
import {useCallback, useEffect, useMemo, useRef, type MouseEvent} from 'react'

function mapAndClamp(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  // Map the value from the input range to the output range
  const mappedValue = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin

  // Clamp the result to ensure it stays within the output range
  return Math.max(outMin, Math.min(outMax, mappedValue))
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

export const Resize: OverlayComponent = (props) => {
  const {PointerEvents, element, node} = props
  const dragging = useRef(false)
  const origin = useRef<{x: number; y: number} | null>(null)

  const {getDocument} = useDocuments()
  const doc = getDocument(node.id)

  const resizeDir = element.getAttribute('data-resize-dir') || 'rtl'
  const mappingAttr = element.getAttribute('data-resize-map')

  const mapping = mappingAttr ? mappingAttr.split(',').map((n) => ~~n) : null

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    origin.current = {
      x: e.clientX,
      y: e.clientY,
    }

    dragging.current = true
  }

  const bounds = element.getBoundingClientRect()

  const patch = useCallback(
    (width: number) => {
      doc.patch(
        ({snapshot}) => {
          const currentValue = get(snapshot, node.path)

          return [at(node.path, set(width))]
        },
        {commit: false},
      )
    },
    [doc, node.path],
  )

  const deferredPatch = useMemo(() => throttle(patch, 25)[0], [patch])
  const deferredCommit = useMemo(() => debounce(doc.commit, 1000), [doc])

  useEffect(() => {
    const handleDrag: any = (e: MouseEvent): void => {
      if (!dragging.current || !origin.current) return

      const deltaX =
        resizeDir === 'ltr' ? origin.current.x - e.clientX : e.clientX - origin.current.x

      const mapped = !mapping
        ? deltaX
        : ~~mapAndClamp(deltaX, mapping[0], mapping[1], mapping[2], mapping[3])

      console.log(mapped)

      const newW = mapping ? mapped : bounds.width + deltaX

      deferredPatch(newW)
      deferredCommit()

      element.style.userSelect = 'none'
      // element.style.cursor = 'none'
      // document.body.style.cursor = 'none'
      // element.style.width = `${newW}px`
    }

    const handleMouseUp: EventListener = (e) => {
      dragging.current = false

      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleDrag as any)
    }

    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleDrag as any)
  }, [])
  return (
    <PointerEvents>
      <div
        className="absolute h-4 w-4 cursor-pointer"
        onMouseDown={handleMouseDown}
        style={{
          bottom: '0px',
          left: resizeDir === 'ltr' ? '0px' : 'unset',
          right: resizeDir === 'rtl' ? '0px' : 'unset',
          background: '#556bfc',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${resizeDir === 'rtl' ? '' : 'rotate-90'}`}
        >
          <path
            d="M21 15L15 21M21 8L8 21"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </PointerEvents>
  )
}
