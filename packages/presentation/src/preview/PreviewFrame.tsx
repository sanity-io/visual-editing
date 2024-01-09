import type { ChannelStatus } from '@sanity/channels'
import { ClientPerspective } from '@sanity/client'
import {
  CheckmarkIcon,
  ChevronDownIcon,
  CopyIcon,
  DatabaseIcon,
  DesktopIcon,
  EditIcon,
  LaunchIcon,
  MobileDeviceIcon,
  PanelLeftIcon,
  PublishIcon,
  RefreshIcon,
  ShareIcon,
} from '@sanity/icons'
import { createPreviewSecret } from '@sanity/preview-url-secret/create-secret'
import {
  hasSecretSearchParams,
  setSecretSearchParams,
  withoutSecretSearchParams,
} from '@sanity/preview-url-secret/without-secret-search-params'
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
  useToast,
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
import { Hotkeys, useClient, useCurrentUser } from 'sanity'
import styled from 'styled-components'

import { ErrorCard } from '../components/ErrorCard'
import { API_VERSION, MAX_TIME_TO_OVERLAYS_CONNECTION } from '../constants'
import { PresentationParams, PresentationPluginOptions } from '../types'
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

interface PreviewFrameProps {
  initialUrl: URL
  targetOrigin: string
  navigatorEnabled: boolean
  onPathChange: (nextPath: string) => void
  openPopup: (url: string) => void
  overlayEnabled: boolean
  params: PresentationParams
  perspective: ClientPerspective
  setPerspective: Dispatch<SetStateAction<ClientPerspective>>
  toggleNavigator?: () => void
  toggleOverlay: () => void
  loadersConnection: ChannelStatus
  overlaysConnection: ChannelStatus
  previewKitConnection: ChannelStatus
  unstable_showUnsafeShareUrl: PresentationPluginOptions['unstable_showUnsafeShareUrl']
}

export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  function PreviewFrame(props, ref) {
    const {
      initialUrl,
      targetOrigin,
      navigatorEnabled,
      onPathChange,
      openPopup,
      overlayEnabled,
      params,
      perspective,
      setPerspective,
      toggleNavigator,
      toggleOverlay,
      loadersConnection,
      overlaysConnection,
      previewKitConnection,
      unstable_showUnsafeShareUrl,
    } = props

    const { devMode } = usePresentationTool()

    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
    const prefersReducedMotion = usePrefersReducedMotion()

    const setDesktopMode = useCallback(() => setMode('desktop'), [setMode])
    const setMobileMode = useCallback(() => setMode('mobile'), [setMode])
    const [loading, setLoading] = useState(true)
    const [timedOut, setTimedOut] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [somethingIsWrong, setSomethingIsWrong] = useState(false)
    const iframeIsBusy =
      loading || refreshing || overlaysConnection === 'connecting'

    const previewLocationOrigin = useMemo(() => {
      return targetOrigin === location.origin ? '' : targetOrigin
    }, [targetOrigin])

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
    const handleContinueAnyway = useCallback(() => {
      setContinueAnyway(true)
    }, [])

    const [continueAnyway, setContinueAnyway] = useState(false)
    const [showOverlaysConnectionStatus, setShowOverlaysConnectionState] =
      useState(false)
    useEffect(() => {
      if (loading || refreshing) {
        return
      }

      if (
        overlaysConnection === 'connecting' ||
        overlaysConnection === 'reconnecting'
      ) {
        const timeout = setTimeout(() => {
          setShowOverlaysConnectionState(true)
        }, 1000)
        return () => clearTimeout(timeout)
      }
      return
    }, [
      overlaysConnection,
      loading,
      refreshing,
      setShowOverlaysConnectionState,
    ])

    useEffect(() => {
      if (loading || refreshing || !showOverlaysConnectionStatus) {
        return
      }
      if (overlaysConnection === 'connected') {
        setSomethingIsWrong(false)
        setShowOverlaysConnectionState(false)
        setTimedOut(false)
        setContinueAnyway(false)
      }
      if (overlaysConnection === 'connecting') {
        const timeout = setTimeout(() => {
          setTimedOut(true)
          // eslint-disable-next-line no-console
          console.error(
            `Unable to connect to overlays. Make sure you're calling the 'enableOverlays' function in '@sanity/overlays' correctly`,
          )
        }, MAX_TIME_TO_OVERLAYS_CONNECTION)
        return () => clearTimeout(timeout)
      }
      if (overlaysConnection === 'reconnecting') {
        const timeout = setTimeout(() => {
          setTimedOut(true)
          setSomethingIsWrong(true)
        }, MAX_TIME_TO_OVERLAYS_CONNECTION)
        return () => clearTimeout(timeout)
      }
      if (overlaysConnection === 'disconnected') {
        setSomethingIsWrong(true)
      }
      return
    }, [loading, overlaysConnection, refreshing, showOverlaysConnectionStatus])

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
                  animate
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
                animate
                content={
                  <Flex align="center" style={{ whiteSpace: 'nowrap' }}>
                    <Box padding={1}>
                      <Text size={1}>
                        {overlayEnabled
                          ? 'Disable edit overlay'
                          : 'Enable edit overlay'}
                      </Text>
                    </Box>
                    <Box paddingY={1}>
                      <Hotkeys
                        keys={['Alt']}
                        style={{ marginTop: -4, marginBottom: -4 }}
                      />
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
                  animate
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
                  openPopup={openPopup}
                  origin={previewLocationOrigin}
                  value={previewLocationRoute}
                  unstable_showUnsafeShareUrl={unstable_showUnsafeShareUrl}
                />
              </Box>

              {unstable_showUnsafeShareUrl && (
                <Flex align="center" flex="none" gap={1}>
                  <MenuButton
                    button={
                      <Button
                        fontSize={1}
                        iconRight={ShareIcon}
                        mode="bleed"
                        padding={3}
                        space={2}
                      />
                    }
                    id="location-menu"
                    menu={
                      <Menu>
                        <ShareUrlMenuItems
                          initialUrl={initialUrl}
                          openPopup={openPopup}
                          previewLocationOrigin={previewLocationOrigin}
                          previewLocationRoute={previewLocationRoute}
                        />
                      </Menu>
                    }
                    popover={{
                      animate: true,
                      constrainSize: true,
                      placement: 'bottom',
                      portal: true,
                    }}
                  />
                </Flex>
              )}

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
                              {createElement(
                                PERSPECTIVE_ICONS['previewDrafts'],
                              )}
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
                                opacity:
                                  perspective === 'previewDrafts' ? 1 : 0,
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
                    animate: true,
                    constrainSize: true,
                    placement: 'bottom',
                    portal: true,
                  }}
                />
              </Flex>

              <Flex align="center" flex="none" gap={1}>
                <Tooltip
                  animate
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
                  animate
                  content={<Text size={1}>Narrow viewport</Text>}
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
                !continueAnyway ? (
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
                      // @TODO Because of Safari we have to do this
                      WebkitBackdropFilter: timedOut
                        ? 'blur(16px) saturate(0.5) grayscale(0.5)'
                        : 'blur(2px)',
                      WebkitTransition:
                        '-webkit-backdrop-filter 0.2s ease-in-out',
                      zIndex: 1,
                    }}
                  >
                    <Flex
                      style={{ ...sizes[mode] }}
                      justify="center"
                      align="center"
                      direction="column"
                      gap={4}
                    >
                      {timedOut && (
                        <Button
                          disabled
                          fontSize={1}
                          mode="ghost"
                          text="Continue anyway"
                          style={{ opacity: 0 }}
                        />
                      )}
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
                      {timedOut && (
                        <Button
                          fontSize={1}
                          // mode="ghost"
                          tone="critical"
                          onClick={handleContinueAnyway}
                          text="Continue anyway"
                        />
                      )}
                    </Flex>
                  </MotionFlex>
                ) : (loading || iframeIsBusy) && !continueAnyway ? (
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
                ) : somethingIsWrong && !continueAnyway ? (
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
                      boxShadow: '0 0 0 1px var(--card-border-color)',
                    }}
                  >
                    <ErrorCard
                      flex={1}
                      message="Could not connect to the preview"
                      onRetry={handleRetry}
                      onContinueAnyway={handleContinueAnyway}
                    >
                      {devMode && (
                        <>
                          {overlaysConnection !== 'connected' && (
                            <Card padding={3} radius={2} tone="critical">
                              <Stack space={3}>
                                <Label muted size={0}>
                                  Overlay connection status
                                </Label>
                                <Code size={1}>{overlaysConnection}</Code>
                              </Stack>
                            </Card>
                          )}

                          {loadersConnection !== 'connected' && (
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
                  pointerEvents:
                    iframeIsBusy && !continueAnyway ? 'none' : 'auto',
                  boxShadow: '0 0 0 1px var(--card-border-color)',
                  borderTop: '1px solid transparent',
                }}
                src={initialUrl.toString()}
                initial={['background']}
                variants={iframeVariants}
                animate={[
                  (loading || iframeIsBusy) && !continueAnyway
                    ? 'background'
                    : 'active',
                  refreshing ? 'reloading' : 'idle',
                  mode,
                  showOverlaysConnectionStatus && !continueAnyway
                    ? 'timedOut'
                    : '',
                ]}
                onLoad={onIFrameLoad}
              />
            </Flex>
          </Card>
        </TooltipDelayGroupProvider>
      </MotionConfig>
    )
  },
)

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
    boxShadow: '0 0 0 0px var(--card-border-color)',
  },
  mobile: {
    ...sizes.mobile,
    boxShadow: '0 0 0 1px var(--card-border-color)',
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

function ShareUrlMenuItems(
  props: Pick<PreviewFrameProps, 'initialUrl' | 'openPopup'> & {
    previewLocationOrigin: string
    previewLocationRoute: string
  },
) {
  const { initialUrl, openPopup, previewLocationOrigin, previewLocationRoute } =
    props

  const handleOpenPopup = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault()
      openPopup(event.currentTarget.href)
    },
    [openPopup],
  )

  return (
    <>
      <CopyUrlMenuButton
        initialUrl={initialUrl}
        previewLocationOrigin={previewLocationOrigin}
        previewLocationRoute={previewLocationRoute}
      />
      <MenuItem
        icon={LaunchIcon}
        text="Open preview"
        as="a"
        href={`${previewLocationOrigin}${previewLocationRoute}`}
        onClick={handleOpenPopup as any}
        rel="opener"
        target="_blank"
      />
    </>
  )
}

function CopyUrlMenuButton(
  props: Pick<PreviewFrameProps, 'initialUrl'> & {
    previewLocationOrigin: string
    previewLocationRoute: string
  },
) {
  const { initialUrl, previewLocationOrigin, previewLocationRoute } = props

  const { push: pushToast } = useToast()
  const client = useClient({ apiVersion: API_VERSION })
  const currentUser = useCurrentUser()
  const [disabled, setDisabled] = useState(false)

  return (
    <MenuItem
      disabled={disabled}
      onClick={() => {
        if (!navigator?.clipboard) {
          pushToast({
            closable: true,
            status: 'error',
            title: 'Clipboard not supported',
          })
          return false
        }
        setDisabled(true)

        let id: string | undefined = undefined
        let url = `${previewLocationOrigin}${previewLocationRoute}`
        const onFinally = () => {
          pushToast({
            id,
            closable: true,
            status: 'success',
            title: 'The URL is copied to the clipboard',
          })
          setDisabled(false)
        }
        const onError = (error: any) => {
          pushToast({
            closable: true,
            status: 'error',
            title: 'Copy failed',
            description: error.message || error.toString(),
          })
          setDisabled(false)
        }
        if (
          hasSecretSearchParams(initialUrl) &&
          typeof ClipboardItem !== 'undefined'
        ) {
          const type = 'text/plain'
          const resolvePreviewUrl = async () => {
            id = pushToast({
              closable: true,
              title: 'Copying URL to clipboard…',
            })
            const previewUrlSecret = await createPreviewSecret(
              client,
              '@sanity/presentation',
              typeof window === 'undefined' ? '' : location.href,
              currentUser?.id,
            )

            const newUrl = setSecretSearchParams(
              initialUrl,
              previewUrlSecret.secret,
              previewLocationRoute,
            )
            url = newUrl.toString()
            return new Blob([url], { type })
          }

          // Try to save to clipboard then save it in the state if worked
          const item = new ClipboardItem({
            [type]: resolvePreviewUrl(),
          })
          navigator.clipboard.write([item]).then(onFinally).catch(onError)
        } else {
          navigator.clipboard.writeText(url).then(onFinally).catch(onError)
        }
      }}
      text="Copy link"
      icon={CopyIcon}
    />
  )
}
