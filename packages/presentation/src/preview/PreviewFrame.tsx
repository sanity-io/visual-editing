import { ClientPerspective } from '@sanity/client'
import {
  CheckmarkIcon,
  ChevronDownIcon,
  DatabaseIcon,
  DesktopIcon,
  EditIcon,
  MobileDeviceIcon,
  PanelLeftIcon,
  PublishIcon,
  RefreshIcon,
} from '@sanity/icons'
import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewSecret,
} from '@sanity/preview-url-secret'
import {
  Box,
  Button,
  ButtonTone,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Switch,
  Text,
  Tooltip,
  TooltipDelayGroupProvider,
} from '@sanity/ui'
import {
  ComponentType,
  createElement,
  Dispatch,
  forwardRef,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react'
import styled from 'styled-components'

import { PresentationParams } from '../types'
import { usePresentationTool } from '../usePresentationTool'
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

const StyledSwitch = styled(Switch)`
  & > span {
    width: 21px;
    height: 13px;
    overflow: hidden;

    & > span:nth-child(1) {
      width: 21px;
      height: 13px;
    }

    & > span:nth-child(2) {
      width: 9px;
      height: 9px;
      top: 2px;
      left: 2px;
    }
  }

  & input:checked + span {
    & > span:nth-child(2) {
      transform: translate3d(8px, 0, 0) !important;
    }
  }
`

const PERSPECTIVE_TITLES: Record<ClientPerspective, string> = {
  previewDrafts: 'Drafts',
  published: 'Published',
  raw: 'Raw',
}

const PERSPECTIVE_TONES: Record<ClientPerspective, ButtonTone> = {
  previewDrafts: 'caution',
  published: 'positive',
  raw: 'default',
}

const PERSPECTIVE_ICONS: Record<ClientPerspective, ComponentType> = {
  previewDrafts: EditIcon,
  published: PublishIcon,
  raw: DatabaseIcon,
}

export const PreviewFrame = forwardRef<
  HTMLIFrameElement,
  {
    initialUrl: string
    targetOrigin: string
    navigatorEnabled: boolean
    onPathChange: (nextPath: string) => void
    overlayEnabled: boolean
    params: PresentationParams
    perspective: ClientPerspective
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
    setPerspective,
    toggleNavigator,
    toggleOverlay,
  } = props

  const { devMode } = usePresentationTool()

  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

  const setDesktopMode = useCallback(() => setMode('desktop'), [setMode])
  const setMobileMode = useCallback(() => setMode('mobile'), [setMode])
  const [refreshing, setRefreshing] = useState(false)

  const previewLocationOrigin = useMemo(() => {
    const { origin: previewOrigin } = new URL(
      params.preview || '/',
      targetOrigin,
    )
    return previewOrigin === location.origin ? '' : previewOrigin
  }, [params.preview, targetOrigin])

  const handleRefresh = useCallback(() => {
    if (typeof ref === 'function' || !ref?.current) {
      return
    }

    // Funky way to reload an iframe without CORS issues
    // eslint-disable-next-line no-self-assign
    // ref.current.src = ref.current.src
    ref.current.src = `${targetOrigin}${params.preview || '/'}`

    setRefreshing(true)
  }, [params.preview, targetOrigin, ref])

  const previewLocationRoute = useMemo(() => {
    const { pathname, searchParams } = new URL(
      params.preview || '/',
      previewLocationOrigin,
    )
    searchParams.delete(urlSearchParamPreviewSecret)
    searchParams.delete(urlSearchParamPreviewPathname)
    return `${pathname}${searchParams.size ? `?${searchParams}` : ''}`
  }, [params.preview, previewLocationOrigin])

  const onIFrameLoad = useCallback(() => {
    setRefreshing(false)
  }, [])

  return (
    <TooltipDelayGroupProvider delay={1000}>
      <Card flex="none" padding={2} shadow={1} style={{ position: 'relative' }}>
        <Flex align="center" gap={2} style={{ minHeight: 0 }}>
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
                padding={3}
                selected={navigatorEnabled}
              />
            </Tooltip>
          )}

          <Tooltip
            content={
              <Flex align="center" style={{ whiteSpace: 'nowrap' }}>
                <Box padding={1}>
                  <Text size={1}>
                    {overlayEnabled
                      ? 'Disable edit overlay'
                      : 'Enable edit overlay'}
                  </Text>
                </Box>
              </Flex>
            }
            fallbackPlacements={['bottom-start']}
            padding={1}
            placement="bottom"
            portal
          >
            <Card
              as="label"
              flex="none"
              padding={3}
              style={{
                lineHeight: 0,
                borderRadius: 999,
                userSelect: 'none',
              }}
              tone={overlayEnabled ? 'positive' : undefined}
            >
              <Flex align="center" gap={2}>
                <div style={{ margin: -2 }}>
                  <StyledSwitch
                    checked={overlayEnabled}
                    onChange={toggleOverlay}
                  />
                </div>
                <Box>
                  <Text muted size={1} weight="medium">
                    Edit
                  </Text>
                </Box>
              </Flex>
            </Card>
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
                padding={3}
              />
            </Tooltip>
          )}

          <Box flex={1}>
            <PreviewLocationInput
              onChange={onPathChange}
              origin={previewLocationOrigin}
              value={previewLocationRoute}
            />
          </Box>

          <Flex align="center" flex="none" gap={1}>
            <MenuButton
              button={
                <Button
                  fontSize={1}
                  iconRight={ChevronDownIcon}
                  mode="bleed"
                  padding={3}
                  space={2}
                  text={PERSPECTIVE_TITLES[perspective]}
                />
              }
              id="perspective-menu"
              menu={
                <Menu style={{ maxWidth: 240 }}>
                  <MenuItem
                    fontSize={1}
                    onClick={() => setPerspective('previewDrafts')}
                    padding={3}
                    pressed={perspective === 'previewDrafts'}
                    tone={PERSPECTIVE_TONES['previewDrafts']}
                  >
                    <Flex align="flex-start" gap={3}>
                      <Box flex="none">
                        <Text size={1}>
                          {createElement(PERSPECTIVE_ICONS['previewDrafts'])}
                        </Text>
                      </Box>
                      <Stack flex={1} space={2}>
                        <Text size={1} weight="medium">
                          {PERSPECTIVE_TITLES['previewDrafts']}
                        </Text>
                        <Text muted size={1}>
                          View this page with latest draft content
                        </Text>
                      </Stack>
                      <Box flex="none">
                        <Text
                          muted
                          size={1}
                          style={{
                            opacity: perspective === 'previewDrafts' ? 1 : 0,
                          }}
                        >
                          <CheckmarkIcon />
                        </Text>
                      </Box>
                    </Flex>
                  </MenuItem>
                  <MenuItem
                    fontSize={1}
                    onClick={() => setPerspective('published')}
                    padding={3}
                    pressed={perspective === 'published'}
                    tone={PERSPECTIVE_TONES['published']}
                  >
                    <Flex align="flex-start" gap={3}>
                      <Box flex="none">
                        <Text size={1}>
                          {createElement(PERSPECTIVE_ICONS['published'])}
                        </Text>
                      </Box>
                      <Stack flex={1} space={2}>
                        <Text size={1} weight="medium">
                          {PERSPECTIVE_TITLES['published']}
                        </Text>
                        <Text muted size={1}>
                          View this page with published content
                        </Text>
                      </Stack>
                      <Box flex="none">
                        <Text
                          muted
                          size={1}
                          style={{
                            opacity: perspective === 'published' ? 1 : 0,
                          }}
                        >
                          <CheckmarkIcon />
                        </Text>
                      </Box>
                    </Flex>
                  </MenuItem>
                </Menu>
              }
              popover={{
                // arrow: false,
                constrainSize: true,
                placement: 'bottom',
                portal: true,
              }}
            />
          </Flex>

          <Flex align="center" flex="none" gap={1}>
            <Tooltip
              content={<Text size={1}>Full viewport</Text>}
              fallbackPlacements={['bottom-start']}
              padding={2}
              placement="bottom"
              portal
            >
              <Button
                aria-label="Full viewport"
                fontSize={1}
                icon={DesktopIcon}
                mode="bleed"
                onClick={setDesktopMode}
                padding={3}
                selected={mode === 'desktop'}
              />
            </Tooltip>
            <Tooltip
              content={<Text size={1}>Narrow viewport</Text>}
              fallbackPlacements={['bottom-start']}
              padding={2}
              placement="bottom"
              portal
            >
              <Button
                aria-label="Narrow viewport"
                fontSize={1}
                icon={MobileDeviceIcon}
                mode="bleed"
                onClick={setMobileMode}
                padding={3}
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
            <IFrame ref={ref} src={initialUrl} onLoad={onIFrameLoad} />
          </IFrameContainerCard>
        </Flex>
      </Card>
    </TooltipDelayGroupProvider>
  )
})
