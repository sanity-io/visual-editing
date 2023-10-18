import { ClientPerspective } from '@sanity/client'
import {
  ChevronDownIcon,
  DesktopIcon,
  EditIcon,
  MobileDeviceIcon,
  RefreshIcon,
} from '@sanity/icons'
import { Box, Button, Card, Flex, Menu, MenuButton, MenuItem } from '@sanity/ui'
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react'
import styled from 'styled-components'

import { ComposerParams } from '../types'
import { useComposer } from '../useComposer'
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

const PERSPECTIVE_TITLES: Record<ClientPerspective, string> = {
  previewDrafts: 'Preview drafts',
  published: 'Published',
  raw: 'Raw',
}

export const PreviewFrame = forwardRef<
  HTMLIFrameElement,
  {
    initialUrl: string
    targetOrigin: string
    onPathChange: (nextPath: string) => void
    overlayEnabled: boolean
    params: ComposerParams
    perspective: ClientPerspective
    pointerEvents?: 'none'
    setPerspective: Dispatch<SetStateAction<ClientPerspective>>
    toggleOverlay: () => void
  }
>(function PreviewFrame(props, ref) {
  const {
    initialUrl,
    targetOrigin,
    onPathChange,
    overlayEnabled,
    params,
    perspective,
    pointerEvents,
    setPerspective,
    toggleOverlay,
  } = props

  const { devMode } = useComposer()

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
          <Flex align="center" flex="none" gap={1}>
            <Button
              aria-label="Toggle edit mode"
              fontSize={1}
              icon={EditIcon}
              mode="bleed"
              onClick={toggleOverlay}
              padding={2}
              selected={overlayEnabled}
            />
            {devMode && (
              <Button
                aria-label="Refresh preview"
                fontSize={1}
                icon={RefreshIcon}
                mode="bleed"
                // todo
                // onClick={handleRefresh}
                padding={2}
              />
            )}
          </Flex>
          <Box flex={1}>
            <PreviewLocationInput
              host={devMode ? previewLocationOrigin : undefined}
              onChange={onPathChange}
              value={params.preview || '/'}
            />
          </Box>
          <Flex align="center" flex="none" gap={1}>
            <MenuButton
              button={
                <Button
                  fontSize={1}
                  iconRight={ChevronDownIcon}
                  mode="bleed"
                  padding={2}
                  space={2}
                  text={PERSPECTIVE_TITLES[perspective]}
                />
              }
              id="perspective-menu"
              menu={
                <Menu>
                  <MenuItem
                    fontSize={1}
                    onClick={() => setPerspective('previewDrafts')}
                    padding={2}
                    pressed={perspective === 'previewDrafts'}
                    text="Preview drafts"
                  />
                  <MenuItem
                    fontSize={1}
                    onClick={() => setPerspective('published')}
                    padding={2}
                    pressed={perspective === 'published'}
                    text="Published"
                  />
                </Menu>
              }
              popover={{
                arrow: false,
                constrainSize: true,
                placement: 'bottom-start',
                portal: true,
              }}
            />
          </Flex>
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
