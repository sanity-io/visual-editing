import type {ChannelsController} from '@repo/channels'
import type {PresentationMsg, VisualEditingConnectionIds} from '@repo/visual-editing-helpers'
import {DesktopIcon} from '@sanity/icons'
import {Card, ThemeProvider, useRootTheme, useTheme, useTheme_v2} from '@sanity/ui'
import {memo, useEffect, useMemo} from 'react'
import {renderToString} from 'react-dom/server'
import {ServerStyleSheet} from 'styled-components'

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
      <Card
        muted
        padding={2}
        border
        radius={2}
        display="inline-block"
        style={{position: 'fixed', top: '5px', left: '5px'}}
      >
        <DesktopIcon />
      </Card>
    ),
    [],
  )

  useEffect(() => {
    const sheet = new ServerStyleSheet()
    try {
      const html = renderToString(
        sheet.collectStyles(
          <ThemeProvider theme={theme} scheme={scheme} tone={tone}>
            {element}
          </ThemeProvider>,
        ),
      )
      const styleTags = sheet.getStyleTags() // or sheet.getStyleElement();
      channel?.send('overlays', 'presentation/rsc', {html, styleTags})
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
