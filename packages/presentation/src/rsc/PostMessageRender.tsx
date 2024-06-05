import type {ChannelsController} from '@repo/channels'
import type {PresentationMsg, VisualEditingConnectionIds} from '@repo/visual-editing-helpers'
import {DesktopIcon} from '@sanity/icons'
import {Button, ThemeProvider, useRootTheme} from '@sanity/ui'
import {memo, useEffect, useMemo} from 'react'
import {renderToString} from 'react-dom/server'
import {ServerStyleSheet, StyleSheetManager} from 'styled-components'

export interface PostMessageRenderProps {
  channel: ChannelsController<VisualEditingConnectionIds, PresentationMsg> | undefined
}

/**
 * Experimental approach for rendering Visual Editing overlays and features
 * using React Server Components over postMessage
 */
function PostMessageRender(props: PostMessageRenderProps): JSX.Element | null {
  const {channel} = props
  const {theme, scheme, tone} = useRootTheme()

  const element = useMemo(
    () => (
      <Button
        icon={<DesktopIcon />}
        style={{position: 'fixed', top: '5px', left: '5px'}}
        text="Hero"
      />
    ),
    [],
  )

  useEffect(() => {
    const sheet = new ServerStyleSheet()
    try {
      const html = renderToString(
        <StyleSheetManager sheet={sheet.instance}>
          <ThemeProvider theme={theme} scheme={scheme} tone={tone}>
            {element}
          </ThemeProvider>
        </StyleSheetManager>,
      )
      const css = sheet.instance.toString()
      channel?.send('overlays', 'presentation/rsc', {html, css})
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      sheet.seal()
    }
  }, [channel, element, scheme, theme, tone])

  return null
}

export default memo(PostMessageRender)
