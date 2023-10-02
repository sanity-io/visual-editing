import { DesktopIcon, MobileDeviceIcon } from '@sanity/icons'
import { Box, Button, Card, Flex } from '@sanity/ui'
import { forwardRef, useCallback, useState } from 'react'
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
    onPathChange: (nextPath: string) => void
    params: ComposerParams
    pointerEvents?: 'none'
  }
>(function PreviewFrame(props, ref) {
  const { initialUrl, onPathChange, params, pointerEvents } = props

  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

  const setDesktopMode = useCallback(() => setMode('desktop'), [setMode])
  const setMobileMode = useCallback(() => setMode('mobile'), [setMode])

  return (
    <>
      <Card flex="none" padding={2} shadow={1} style={{ position: 'relative' }}>
        <Flex align="center" gap={2} style={{ minHeight: 0 }}>
          <Box flex={1}>
            <PreviewLocationInput
              onChange={onPathChange}
              value={params.preview || '/'}
            />
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
            <IFrame ref={ref} src={initialUrl} style={{ pointerEvents }} />
          </IFrameContainerCard>
        </Flex>
      </Card>
    </>
  )
})
