import { studioTheme, ThemeProvider } from '@sanity/ui'
import { ChannelEventHandler } from 'channels'
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import styled from 'styled-components'
import type { VisualEditingMsg } from 'visual-editing-helpers'

import { HistoryAdapter, OverlayEventHandler } from '../types'
import { ElementOverlay } from './ElementOverlay'
import { elementsReducer } from './elementsReducer'
import { useChannel } from './useChannel'
import { useOverlay } from './useOverlay'

const Root = styled.div`
  background-color: transparent;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 9999999;
`

export const VisualEditing: FunctionComponent<{ history?: HistoryAdapter }> =
  function (props) {
    const { history } = props
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
        if (type === 'composer/focus' && data.path?.length) {
          dispatch({ type, data })
        }
        if (type === 'composer/blur') {
          dispatch({ type, data })
        }
        if (type === 'composer/navigate') {
          history?.update(data)
        }
        if (type === 'composer/toggleOverlay') {
          setOverlayEnabled((enabled) => !enabled)
        }
      },
      [history],
    )

    const channel = useChannel<VisualEditingMsg>(channelEventHandler)

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

    const overlay = useOverlay(rootElement, overlayEventHandler)

    useEffect(() => {
      if (overlayEnabled) {
        overlay?.activate()
      } else {
        overlay?.deactivate()
      }
    }, [channel, overlay, overlayEnabled])

    useEffect(() => {
      return history?.subscribe((update) => {
        channel?.send('overlay/navigate', update)
      })
    }, [channel, history])

    return (
      <ThemeProvider theme={studioTheme} tone="transparent">
        <Root ref={setRootElement}>
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
