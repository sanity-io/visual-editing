import { ClientPerspective } from '@sanity/client'
import {
  ChevronDownIcon,
  DesktopIcon,
  EditIcon,
  MobileDeviceIcon,
  PanelLeftIcon,
  RefreshIcon,
} from '@sanity/icons'
import {
  Box,
  Button,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Text,
  Tooltip,
} from '@sanity/ui'
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
    navigatorEnabled: boolean
    onPathChange: (nextPath: string) => void
    overlayEnabled: boolean
    params: ComposerParams
    perspective: ClientPerspective
    pointerEvents?: 'none'
    setPerspective: Dispatch<SetStateAction<ClientPerspective>>
    toggleNavigator?: () => void
    toggleOverlay: () => void
  }
>(function PreviewFrame(props, ref) {
  const {
    initialUrl,
    targetOrigin,
    navigatorEnabled,
    onPathChange,
    overlayEnabled,
    params,
    perspective,
    pointerEvents,
    setPerspective,
    toggleNavigator,
    toggleOverlay,
  } = props

  const { devMode } = useComposer()

  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

  const setDesktopMode = useCallback(() => setMode('desktop'), [setMode])
  const setMobileMode = useCallback(() => setMode('mobile'), [setMode])
  const [refreshing, setRefreshing] = useState(false)

  const previewLocationOrigin = useMemo(() => {
    const { origin: parsedTargetOrigin } = new URL(targetOrigin, location.href)
    const { origin: previewOrigin } = new URL(
      params.preview || '/',
      parsedTargetOrigin,
    )
    return previewOrigin === location.origin ? undefined : previewOrigin
  }, [params.preview, targetOrigin])

  const handleRefresh = useCallback(() => {
    if (typeof ref === 'function' || !ref?.current) {
      return
    }

    // Funky way to reload an iframe without CORS issues
    // eslint-disable-next-line no-self-assign
    // ref.current.src = ref.current.src
    ref.current.src = `${previewLocationOrigin}${params.preview || '/'}`

    setRefreshing(true)
  }, [params.preview, previewLocationOrigin, ref])

  const onIFrameLoad = useCallback(() => {
    setRefreshing(false)
  }, [])
  return (
    <>
      <Card flex="none" padding={2} shadow={1} style={{ position: 'relative' }}>
        <Flex align="center" gap={1} style={{ minHeight: 0 }}>
          <Flex align="center" flex="none" gap={1}>
            {toggleNavigator && (
              <Tooltip
                content={<Text size={1}>Toggle navigator</Text>}
                fallbackPlacements={['bottom-start']}
                padding={2}
                placement="bottom"
                portal
              >
                <Button
                  aria-label="Toggle navigator"
                  fontSize={1}
                  icon={PanelLeftIcon}
                  mode="bleed"
                  onClick={toggleNavigator}
                  padding={2}
                  selected={navigatorEnabled}
                />
              </Tooltip>
            )}
            <Tooltip
              content={<Text size={1}>Toggle edit mode</Text>}
              fallbackPlacements={['bottom-start']}
              padding={2}
              placement="bottom"
              portal
            >
              <Button
                aria-label="Toggle edit mode"
                fontSize={1}
                icon={EditIcon}
                mode="bleed"
                onClick={toggleOverlay}
                padding={2}
                selected={overlayEnabled}
              />
            </Tooltip>
            {devMode && (
              <Tooltip
                content={
                  <Text size={1}>
                    {refreshing ? 'Refreshing…' : 'Refresh preview'}
                  </Text>
                }
                fallbackPlacements={['bottom-start']}
                padding={2}
                placement="bottom"
                portal
              >
                <Button
                  aria-label="Refresh preview"
                  fontSize={1}
                  icon={RefreshIcon}
                  mode="bleed"
                  loading={refreshing}
                  onClick={handleRefresh}
                  padding={2}
                />
              </Tooltip>
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
                    onClick={() => {
                      setPerspective('previewDrafts')
                      handleRefresh()
                    }}
                    padding={2}
                    pressed={perspective === 'previewDrafts'}
                    text="Preview drafts"
                  />
                  <MenuItem
                    fontSize={1}
                    onClick={() => {
                      setPerspective('published')
                      handleRefresh()
                    }}
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
            <Tooltip
              content={<Text size={1}>Desktop viewport</Text>}
              fallbackPlacements={['bottom-start']}
              padding={2}
              placement="bottom"
              portal
            >
              <Button
                aria-label="Desktop viewport"
                fontSize={1}
                icon={DesktopIcon}
                mode="bleed"
                onClick={setDesktopMode}
                padding={2}
                selected={mode === 'desktop'}
              />
            </Tooltip>
            <Tooltip
              content={<Text size={1}>Mobile viewport</Text>}
              fallbackPlacements={['bottom-start']}
              padding={2}
              placement="bottom"
              portal
            >
              <Button
                aria-label="Mobile viewport"
                fontSize={1}
                icon={MobileDeviceIcon}
                mode="bleed"
                onClick={setMobileMode}
                padding={2}
                selected={mode === 'mobile'}
              />
            </Tooltip>
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
              // src={`${previewLocationOrigin}${params.preview || '/'}`}
              style={{ pointerEvents }}
              onLoad={onIFrameLoad}
            />
          </IFrameContainerCard>
        </Flex>
      </Card>
    </>
  )
})
