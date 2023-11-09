import { studioTheme, ThemeProvider } from '@sanity/ui'
import { ChannelEventHandler } from 'channels'
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'
import { isModKeyEvent, type VisualEditingMsg } from 'visual-editing-helpers'

import { HistoryAdapter, OverlayEventHandler } from '../types'
import { ElementOverlay } from './ElementOverlay'
import { elementsReducer } from './elementsReducer'
import { useChannel } from './useChannel'
import { useController } from './useController'

const Root = styled.div<{
  $zIndex?: string | number
}>`
  background-color: transparent;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: ${({ $zIndex }) => $zIndex ?? '9999999'};
`

function raf2(fn: () => void) {
  let r0: number | undefined = undefined
  let r1: number | undefined = undefined

  r0 = requestAnimationFrame(() => {
    r1 = requestAnimationFrame(fn)
  })

  return () => {
    if (r0 !== undefined) cancelAnimationFrame(r0)
    if (r1 !== undefined) cancelAnimationFrame(r1)
  }
}

/**
 * @internal
 */
export const Overlays: FunctionComponent<{
  history?: HistoryAdapter
  allowStudioOrigin: string
  zIndex?: string | number
}> = function (props) {
  const { history, allowStudioOrigin, zIndex } = props
  const [elements, dispatch] = useReducer(elementsReducer, [])
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)
  const [overlayEnabled, setOverlayEnabled] = useState(true)

  const elementsToRender = useMemo(
    () => elements.filter((e) => e.activated || e.focused),
    [elements],
  )

  const channelEventHandler = useCallback<
    ChannelEventHandler<VisualEditingMsg>
  >(
    (type, data) => {
      if (type === 'presentation/focus' && data.path?.length) {
        dispatch({ type, data })
      }
      if (type === 'presentation/blur') {
        dispatch({ type, data })
      }
      if (type === 'presentation/navigate') {
        history?.update(data)
      }
      if (type === 'presentation/toggleOverlay') {
        setOverlayEnabled((enabled) => !enabled)
      }
    },
    [history],
  )

  const allowOrigin = useMemo(() => {
    // previewUrl might be relative, if it is we set `targetOrigin` to the same origin as the Studio
    // if it's an absolute URL we extract the origin from it
    const url = new URL(allowStudioOrigin, location.href)
    return url.origin
  }, [allowStudioOrigin])

  const channel = useChannel<VisualEditingMsg>(channelEventHandler, allowOrigin)

  const overlayEventHandler: OverlayEventHandler = useCallback(
    (message) => {
      if (message.type === 'element/click') {
        channel?.send('overlay/focus', message.sanity)
      } else if (message.type === 'overlay/activate') {
        channel?.send('overlay/toggle', { enabled: true })
      } else if (message.type === 'overlay/deactivate') {
        channel?.send('overlay/toggle', { enabled: false })
      }
      dispatch(message)
    },
    [channel],
  )

  const controller = useController(
    rootElement,
    overlayEventHandler,
    !!channel?.inFrame,
  )

  useEffect(() => {
    if (overlayEnabled) {
      controller?.activate()
    } else {
      controller?.deactivate()
    }
  }, [channel, controller, overlayEnabled])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.metaKey) {
        event.preventDefault()
        const newEvent = new MouseEvent(event.type, {
          ...event,
          metaKey: false,
          bubbles: true,
          cancelable: true,
        })
        event.target?.dispatchEvent(newEvent)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isModKeyEvent(e)) {
        setOverlayEnabled((enabled) => !enabled)
      }
    }
    const handleKeydown = (e: KeyboardEvent) => {
      if (isModKeyEvent(e)) {
        setOverlayEnabled((enabled) => !enabled)
      }
    }
    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setOverlayEnabled])

  useEffect(() => {
    return history?.subscribe((update) => {
      channel?.send('overlay/navigate', update)
    })
  }, [channel, history])

  const [overlaysFlash, setOverlaysFlash] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const fadeOutTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Flash overlays when they are enabled
  useEffect(() => {
    if (overlayEnabled) {
      return raf2(() => {
        setOverlaysFlash(true)
        raf2(() => {
          setFadingOut(true)
          fadeOutTimeoutRef.current = setTimeout(() => {
            setFadingOut(false)
            setOverlaysFlash(false)
          }, 1500)
        })
      })
    } else if (fadeOutTimeoutRef.current) {
      clearTimeout(fadeOutTimeoutRef.current)
      setOverlaysFlash(false)
      setFadingOut(false)
    }

    return
  }, [overlayEnabled])

  return (
    <ThemeProvider theme={studioTheme} tone="transparent">
      <Root
        data-fading-out={fadingOut ? '' : undefined}
        data-overlays={overlaysFlash ? '' : undefined}
        ref={setRootElement}
        $zIndex={zIndex}
      >
        {elementsToRender.map(({ id, focused, hovered, rect, sanity }) => {
          return (
            <ElementOverlay
              key={id}
              rect={rect}
              focused={focused}
              hovered={hovered}
              showActions={!channel?.inFrame}
              sanity={sanity}
            />
          )
        })}
      </Root>
    </ThemeProvider>
  )
}
