import { DesktopIcon, EditIcon, MobileDeviceIcon } from '@sanity/icons'
import { Box, Button, Card, Flex, Inline, Text } from '@sanity/ui'
import { forwardRef, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ComposerParams } from '../types'
import { PreviewLocationInput } from './PreviewLocationInput'

const IFrame = styled.iframe`
  border: 0;
  height: 100%;
  width: 100%;
  display: block;
`

const IFrameContainerCard = styled(Card)`
  max-width: 100%;
  max-height: 100%;
  transition:
    max-width 100ms ease,
    max-height 100ms ease;
`

export const PreviewFrame = forwardRef<
  HTMLIFrameElement,
  {
    initialUrl: string
    targetOrigin: string
    onPathChange: (nextPath: string) => void
    overlayEnabled: boolean
    params: ComposerParams
    pointerEvents?: 'none'
    toggleOverlay: () => void
  }
>(function PreviewFrame(props, ref) {
  const {
    initialUrl,
    targetOrigin,
    onPathChange,
    overlayEnabled,
    params,
    pointerEvents,
    toggleOverlay,
  } = props

  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

  const setDesktopMode = useCallback(() => setMode('desktop'), [setMode])
  const setMobileMode = useCallback(() => setMode('mobile'), [setMode])

  // @TODO handle targetOrigin, or another way of asking for the current location when CORS doesn't allow reading `location.pathname` directly
  // const onIFrameLoad = useCallback(() => {
  //   if (typeof ref !== 'function' && ref?.current?.contentWindow) {
  //     onPathChange(ref.current.contentWindow.location.pathname)
  //   }
  // }, [onPathChange, ref])

  const previewLocationOrigin = useMemo(() => {
    const { origin: parsedTargetOrigin } = new URL(targetOrigin, location.href)
    const { origin: previewOrigin } = new URL(
      params.preview || '/',
      parsedTargetOrigin,
    )
    return previewOrigin === location.origin ? undefined : previewOrigin
  }, [params.preview, targetOrigin])

  return (
    <>
      <Card flex="none" padding={2} shadow={1} style={{ position: 'relative' }}>
        <Flex align="center" gap={1} style={{ minHeight: 0 }}>
          <Flex flex="none">
            <Button
              fontSize={1}
              icon={EditIcon}
              mode="bleed"
              onClick={toggleOverlay}
              padding={2}
              selected={overlayEnabled}
            />
          </Flex>
          <Box flex={1}>
            <Inline space={1}>
              {previewLocationOrigin && (
                <Text
                  muted
                  size={1}
                  style={{ transform: 'translate(0.3rem, 0.3rem)' }}
                >
                  {previewLocationOrigin}
                </Text>
              )}
              <PreviewLocationInput
                onChange={onPathChange}
                value={params.preview || '/'}
              />
            </Inline>
          </Box>
          <Flex align="center" flex="none" gap={1}>
            <Button
              fontSize={1}
              icon={DesktopIcon}
              mode="bleed"
              onClick={setDesktopMode}
              padding={2}
              selected={mode === 'desktop'}
            />
            <Button
              fontSize={1}
              icon={MobileDeviceIcon}
              mode="bleed"
              onClick={setMobileMode}
              padding={2}
              selected={mode === 'mobile'}
            />
          </Flex>
        </Flex>
      </Card>
      <Card flex={1} padding={mode === 'desktop' ? 0 : 2} tone="transparent">
        <Flex align="center" height="fill" justify="center">
          <IFrameContainerCard
            flex={1}
            height="fill"
            shadow={1}
            style={{
              maxWidth: mode === 'desktop' ? undefined : 375,
              maxHeight: mode === 'desktop' ? undefined : 650,
            }}
          >
            <IFrame
              ref={ref}
              src={initialUrl}
              style={{ pointerEvents }}
              // onLoad={onIFrameLoad}
            />
          </IFrameContainerCard>
        </Flex>
      </Card>
    </>
  )
})
