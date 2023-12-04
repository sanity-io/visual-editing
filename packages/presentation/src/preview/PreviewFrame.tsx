import type { ConnectionStatus } from '@sanity/channels'
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
import { withoutSecretSearchParams } from '@sanity/preview-url-secret/without-secret-search-params'
import {
  Box,
  Button,
  ButtonTone,
  Card,
  Code,
  Flex,
  Label,
  Menu,
  MenuButton,
  MenuItem,
  Spinner,
  Stack,
  Switch,
  Text,
  Tooltip,
  TooltipDelayGroupProvider,
  usePrefersReducedMotion,
} from '@sanity/ui'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import {
  ComponentType,
  createElement,
  Dispatch,
  forwardRef,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import styled from 'styled-components'

import { ErrorCard } from '../components/ErrorCard'
import { MAX_TIME_TO_OVERLAYS_CONNECTION } from '../constants'
import { PresentationParams } from '../types'
import { usePresentationTool } from '../usePresentationTool'
import { IFrame } from './IFrame'
import { PreviewLocationInput } from './PreviewLocationInput'

const MotionFlex = motion(Flex)

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
    initialUrl: URL
    targetOrigin: string
    navigatorEnabled: boolean
    onPathChange: (nextPath: string) => void
    overlayEnabled: boolean
    params: PresentationParams
    perspective: ClientPerspective
    setPerspective: Dispatch<SetStateAction<ClientPerspective>>
    toggleNavigator?: () => void
    toggleOverlay: () => void
    loadersConnection: ConnectionStatus
    overlaysConnection: ConnectionStatus
    previewKitConnection: ConnectionStatus
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
    loadersConnection,
    overlaysConnection,
    previewKitConnection,
  } = props

  const { devMode } = usePresentationTool()

  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
  const prefersReducedMotion = usePrefersReducedMotion()

  const setDesktopMode = useCallback(() => setMode('desktop'), [setMode])
  const setMobileMode = useCallback(() => setMode('mobile'), [setMode])
  const [loading, setLoading] = useState(true)
  const [timedOut, setTimedOut] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const iframeIsBusy =
    loading || refreshing || overlaysConnection === 'connecting'
  const somethingIsWrong =
    overlaysConnection === 'unhealthy' ||
    overlaysConnection === 'disconnected' ||
    loadersConnection === 'unhealthy' ||
    loadersConnection === 'disconnected' ||
    previewKitConnection === 'unhealthy' ||
    previewKitConnection === 'disconnected'

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
  const handleRetry = useCallback(() => {
    if (typeof ref === 'function' || !ref?.current) {
      return
    }

    ref.current.src = initialUrl.toString()

    setRefreshing(true)
  }, [ref, initialUrl])

  const [showOverlaysConnectionStatus, setShowOverlaysConnectionState] =
    useState(false)
  useEffect(() => {
    if (loading || refreshing) {
      return
    }

    if (overlaysConnection === 'connecting') {
      const timeout = setTimeout(() => {
        setShowOverlaysConnectionState(true)
      }, 3000)
      return () => clearTimeout(timeout)
    }
    return
  }, [overlaysConnection, loading, refreshing])
  useEffect(() => {
    if (loading || refreshing || !showOverlaysConnectionStatus) {
      return
    }
    if (overlaysConnection === 'connected') {
      setTimedOut(false)
    }
    if (overlaysConnection === 'connecting') {
      const timeout = setTimeout(() => {
        setTimedOut(true)
        // eslint-disable-next-line no-console
        console.error(
          `Unable to connect to overlays. Make sure you're calling the 'enableOverlays' function in '@sanity/overlays' correctly, and that its 'allowStudioOrigin' property is set to '${location.origin}'`,
        )
      }, MAX_TIME_TO_OVERLAYS_CONNECTION)
      return () => clearTimeout(timeout)
    }
    return
  }, [overlaysConnection, loading, refreshing, showOverlaysConnectionStatus])

  const previewLocationRoute = useMemo(() => {
    const previewUrl = new URL(params.preview || '/', targetOrigin)
    const { pathname, search } = withoutSecretSearchParams(previewUrl)

    return `${pathname}${search}`
  }, [params.preview, targetOrigin])

  const onIFrameLoad = useCallback(() => {
    setLoading(false)
    setRefreshing(false)
  }, [])

  return (
    <MotionConfig
      transition={prefersReducedMotion ? { duration: 0 } : undefined}
    >
      <TooltipDelayGroupProvider delay={1000}>
        <Card
          flex="none"
          padding={2}
          shadow={1}
          style={{ position: 'relative' }}
        >
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
                      disabled={iframeIsBusy}
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
                    loading={
                      iframeIsBusy ||
                      (loadersConnection === 'connecting' &&
                        previewKitConnection !== 'connected')
                    }
                    disabled={loadersConnection !== 'connected'}
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

        <Card flex={1} tone="transparent">
          <Flex
            align="center"
            height="fill"
            justify="center"
            padding={mode === 'desktop' ? 0 : 2}
            sizing="border"
            style={{
              position: 'relative',
              cursor: iframeIsBusy ? 'wait' : undefined,
            }}
          >
            <AnimatePresence>
              {!somethingIsWrong &&
              !loading &&
              !refreshing &&
              showOverlaysConnectionStatus &&
              loadersConnection === 'connecting' ? (
                <MotionFlex
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={spinnerVariants}
                  justify="center"
                  align="center"
                  style={{
                    inset: `0`,
                    position: `absolute`,
                    backdropFilter: timedOut
                      ? 'blur(16px) saturate(0.5) grayscale(0.5)'
                      : 'blur(2px)',
                    ['transition' as string]:
                      'backdrop-filter 0.2s ease-in-out',
                    zIndex: 1,
                  }}
                >
                  <Flex
                    style={{ ...sizes[mode] }}
                    justify="center"
                    align="center"
                  >
                    <Card
                      radius={2}
                      tone={timedOut ? 'caution' : 'inherit'}
                      padding={4}
                      shadow={1}
                    >
                      <Flex
                        justify="center"
                        align="center"
                        direction="column"
                        gap={4}
                      >
                        <Spinner muted />
                        <Text muted size={1}>
                          {timedOut ? (
                            <>
                              Unable to connect, check the browser console for
                              more information.
                            </>
                          ) : (
                            'Connecting…'
                          )}
                        </Text>
                      </Flex>
                    </Card>
                  </Flex>
                </MotionFlex>
              ) : loading || iframeIsBusy ? (
                <MotionFlex
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={spinnerVariants}
                  justify="center"
                  align="center"
                  style={{
                    inset: `0`,
                    position: `absolute`,
                    // boxShadow: '0 0 0 1px var(--card-shadow-outline-color)',
                  }}
                >
                  <Flex
                    style={{ ...sizes[mode] }}
                    justify="center"
                    align="center"
                    direction="column"
                    gap={4}
                  >
                    <Spinner muted />
                    <Text muted size={1}>
                      Loading…
                    </Text>
                  </Flex>
                </MotionFlex>
              ) : somethingIsWrong && !iframeIsBusy ? (
                <MotionFlex
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={errorVariants}
                  justify="center"
                  align="center"
                  style={{
                    background: 'var(--card-bg-color)',
                    inset: `0`,
                    position: `absolute`,
                    borderTop: '1px solid transparent',
                    boxShadow: '0 0 0 1px var(--card-shadow-outline-color)',
                  }}
                >
                  <ErrorCard
                    flex={1}
                    message="Could not connect to the preview"
                    onRetry={handleRetry}
                  >
                    {devMode && (
                      <>
                        {(overlaysConnection === 'unhealthy' ||
                          overlaysConnection === 'disconnected') && (
                          <Card padding={3} radius={2} tone="critical">
                            <Stack space={3}>
                              <Label muted size={0}>
                                Overlay connection status
                              </Label>
                              <Code size={1}>{overlaysConnection}</Code>
                            </Stack>
                          </Card>
                        )}

                        {(loadersConnection === 'unhealthy' ||
                          loadersConnection === 'disconnected') && (
                          <Card padding={3} radius={2} tone="critical">
                            <Stack space={3}>
                              <Label muted size={0}>
                                Loader connection status
                              </Label>
                              <Code size={1}>{loadersConnection}</Code>
                            </Stack>
                          </Card>
                        )}
                      </>
                    )}
                  </ErrorCard>
                </MotionFlex>
              ) : null}
            </AnimatePresence>
            <IFrame
              ref={ref}
              style={{
                pointerEvents: iframeIsBusy ? 'none' : 'auto',
                boxShadow: '0 0 0 1px var(--card-shadow-outline-color)',
                borderTop: '1px solid transparent',
              }}
              src={initialUrl.toString()}
              initial={['background']}
              variants={iframeVariants}
              animate={[
                loading || iframeIsBusy ? 'background' : 'active',
                refreshing ? 'reloading' : 'idle',
                mode,
                showOverlaysConnectionStatus ? 'timedOut' : '',
              ]}
              onLoad={onIFrameLoad}
            />
          </Flex>
        </Card>
      </TooltipDelayGroupProvider>
    </MotionConfig>
  )
})

const sizes = {
  desktop: {
    width: '100%',
    height: '100%',
  },
  mobile: {
    width: 375,
    height: 650,
  },
}

const spinnerVariants = {
  initial: { opacity: 1 },
  animate: { opacity: [0, 0, 1] },
  exit: { opacity: [1, 0, 0] },
}

const errorVariants = {
  initial: { opacity: 1 },
  animate: { opacity: [0, 0, 1] },
  exit: { opacity: [1, 0, 0] },
}

const iframeVariants = {
  desktop: {
    ...sizes.desktop,
    boxShadow: '0 0 0 0px var(--card-shadow-outline-color)',
  },
  mobile: {
    ...sizes.mobile,
    boxShadow: '0 0 0 1px var(--card-shadow-outline-color)',
  },
  background: {
    opacity: 0,
    scale: 1,
  },
  idle: {
    scale: 1,
  },
  reloading: {
    scale: [1, 1, 1, 0.98],
  },
  active: {
    opacity: [0, 0, 1],
    scale: 1,
  },
  timedOut: {
    opacity: [0, 0, 1],
  },
}
