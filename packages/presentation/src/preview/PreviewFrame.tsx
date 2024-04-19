import type {ChannelStatus} from '@repo/channels'
import {
  CheckmarkIcon,
  ChevronDownIcon,
  DesktopIcon,
  DocumentIcon,
  EditIcon,
  MobileDeviceIcon,
  PanelLeftIcon,
  PublishIcon,
  RefreshIcon,
  ShareIcon,
} from '@sanity/icons'
import {withoutSecretSearchParams} from '@sanity/preview-url-secret/without-secret-search-params'
import {
  Box,
  Button,
  type ButtonTone,
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
import {AnimatePresence, motion, MotionConfig} from 'framer-motion'
import {
  type ComponentType,
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {Hotkeys} from 'sanity'

import {ErrorCard} from '../components/ErrorCard'
import {MAX_TIME_TO_OVERLAYS_CONNECTION} from '../constants'
import {
  ACTION_IFRAME_LOADED,
  ACTION_IFRAME_RELOAD,
  ACTION_MAIN_DOCUMENT,
  ACTION_PERSPECTIVE,
  ACTION_VIEWPORT,
  type DispatchPresentationAction,
  type PresentationState,
} from '../reducers/presentationReducer'
import type {PresentationParams} from '../types'
import {usePresentationTool} from '../usePresentationTool'
import {IFrame} from './IFrame'
import {PreviewLocationInput} from './PreviewLocationInput'
import {ShareUrlMenuItems} from './ShareUrlMenuItems'

const MotionFlex = motion(Flex)

const PERSPECTIVE_TITLES: Record<PresentationState['perspective'], string> = {
  previewDrafts: 'Drafts',
  published: 'Published',
}

const PERSPECTIVE_TONES: Record<PresentationState['perspective'], ButtonTone> = {
  previewDrafts: 'caution',
  published: 'positive',
}

const PERSPECTIVE_ICONS: Record<PresentationState['perspective'], ComponentType> = {
  previewDrafts: EditIcon,
  published: PublishIcon,
}

export interface PreviewFrameProps
  extends Pick<PresentationState, 'iframe' | 'perspective' | 'viewport' | 'visualEditing'> {
  dispatch: DispatchPresentationAction
  initialUrl: URL
  loadersConnection: ChannelStatus
  navigatorEnabled: boolean
  onPathChange: (nextPath: string) => void
  onRefresh: (fallback: () => void) => void
  openPopup: (url: string) => void
  overlaysConnection: ChannelStatus
  params: PresentationParams
  targetOrigin: string
  toggleNavigator?: () => void
  toggleOverlay: () => void
}

export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  function PreviewFrame(props, ref) {
    const {
      dispatch,
      iframe,
      initialUrl,
      loadersConnection,
      navigatorEnabled,
      onPathChange,
      onRefresh,
      openPopup,
      overlaysConnection,
      params,
      perspective,
      targetOrigin,
      toggleNavigator,
      toggleOverlay,
      viewport,
      visualEditing: {overlaysEnabled},
    } = props

    const {devMode} = usePresentationTool()

    const prefersReducedMotion = usePrefersReducedMotion()

    const toggleMainDocumentView = useCallback(() => {
      dispatch({
        type: ACTION_MAIN_DOCUMENT,
        mainDocument: !params.mainDocument,
      })
    }, [params.mainDocument, dispatch])

    const toggleViewportSize = useCallback(
      () =>
        dispatch({
          type: ACTION_VIEWPORT,
          viewport: viewport === 'desktop' ? 'mobile' : 'desktop',
        }),
      [dispatch, viewport],
    )
    const loading = iframe.status === 'loading' || iframe.status === 'reloading'
    const [timedOut, setTimedOut] = useState(false)
    const refreshing = iframe.status === 'refreshing'
    const [somethingIsWrong, setSomethingIsWrong] = useState(false)
    const iframeIsBusy = loading || refreshing || overlaysConnection === 'connecting'

    const previewLocationOrigin = useMemo(() => {
      return targetOrigin === location.origin ? '' : targetOrigin
    }, [targetOrigin])

    const handleRefresh = useCallback(() => {
      onRefresh(() => {
        if (typeof ref === 'function' || !ref?.current) {
          return
        }
        dispatch({type: ACTION_IFRAME_RELOAD})
        // Funky way to reload an iframe without CORS issues
        // eslint-disable-next-line no-self-assign
        // ref.current.src = ref.current.src
        ref.current.src = `${targetOrigin}${params.preview || '/'}`
      })
    }, [dispatch, onRefresh, params.preview, targetOrigin, ref])
    const handleRetry = useCallback(() => {
      if (typeof ref === 'function' || !ref?.current) {
        return
      }

      ref.current.src = initialUrl.toString()

      dispatch({type: ACTION_IFRAME_RELOAD})
    }, [dispatch, ref, initialUrl])
    const handleContinueAnyway = useCallback(() => {
      setContinueAnyway(true)
    }, [])

    const [continueAnyway, setContinueAnyway] = useState(false)
    const [showOverlaysConnectionStatus, setShowOverlaysConnectionState] = useState(false)
    useEffect(() => {
      if (loading || refreshing) {
        return
      }

      if (overlaysConnection === 'connecting' || overlaysConnection === 'reconnecting') {
        const timeout = setTimeout(() => {
          setShowOverlaysConnectionState(true)
        }, 1000)
        return () => clearTimeout(timeout)
      }
      return
    }, [overlaysConnection, loading, refreshing])

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
            `Unable to connect to visual editing. Make sure you've setup '@sanity/visual-editing' correctly`,
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
      const {pathname, search} = withoutSecretSearchParams(previewUrl)

      return `${pathname}${search}`
    }, [params.preview, targetOrigin])

    const onIFrameLoad = useCallback(() => {
      dispatch({type: ACTION_IFRAME_LOADED})
    }, [dispatch])

    /**
     * Ensure that clicking outside of menus and dialogs will close as focus shifts to the iframe
     */
    useEffect(() => {
      if (typeof ref === 'function' || !ref?.current) {
        return
      }
      const instance = ref.current
      function handleBlur() {
        if (instance !== document.activeElement) {
          return
        }

        instance.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}))
      }
      window.addEventListener('blur', handleBlur)
      return () => {
        window.removeEventListener('blur', handleBlur)
      }
    }, [ref])

    return (
      <MotionConfig transition={prefersReducedMotion ? {duration: 0} : undefined}>
        <TooltipDelayGroupProvider delay={1000}>
          <Card flex="none" padding={2} shadow={1} style={{position: 'relative'}}>
            <Flex align="center" style={{minHeight: 0}}>
              {toggleNavigator && (
                <Box flex="none" marginRight={1} padding={1}>
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
                      padding={2}
                      selected={navigatorEnabled}
                    />
                  </Tooltip>
                </Box>
              )}

              <Tooltip
                animate
                content={
                  <Flex align="center" style={{whiteSpace: 'nowrap'}}>
                    <Box padding={1}>
                      <Text size={1}>
                        {overlaysEnabled ? 'Disable edit overlay' : 'Enable edit overlay'}
                      </Text>
                    </Box>
                    <Box paddingY={1}>
                      <Hotkeys keys={['Alt']} style={{marginTop: -4, marginBottom: -4}} />
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
                  marginRight={1}
                  padding={3}
                  style={{
                    lineHeight: 0,
                    borderRadius: 999,
                    userSelect: 'none',
                  }}
                  tone={overlaysEnabled ? 'transparent' : undefined}
                >
                  <Flex align="center" gap={3}>
                    <div style={{margin: -4}}>
                      <Switch
                        checked={overlaysEnabled}
                        onChange={toggleOverlay}
                        disabled={iframe.status === 'loading' || overlaysConnection !== 'connected'}
                      />
                    </div>
                    <Box>
                      <Text muted={!overlaysEnabled} size={1} weight="medium">
                        Edit
                      </Text>
                    </Box>
                  </Flex>
                </Card>
              </Tooltip>

              <Box flex={1} marginX={1}>
                <PreviewLocationInput
                  prefix={
                    <Box padding={1}>
                      <Tooltip
                        animate
                        content={
                          <Text size={1}>
                            {iframe.status === 'loading'
                              ? 'Loading…'
                              : iframe.status === 'reloading'
                                ? 'Refreshing…'
                                : iframe.status === 'refreshing'
                                  ? 'Refreshing…'
                                  : 'Refresh preview'}
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
                          loading={iframe.status === 'reloading' || iframe.status === 'refreshing'}
                          onClick={handleRefresh}
                          padding={2}
                        />
                      </Tooltip>
                    </Box>
                  }
                  onChange={onPathChange}
                  origin={previewLocationOrigin}
                  suffix={
                    <Box padding={1}>
                      <MenuButton
                        button={
                          <Button
                            fontSize={1}
                            iconRight={ShareIcon}
                            mode="bleed"
                            padding={2}
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
                    </Box>
                  }
                  value={previewLocationRoute}
                />
              </Box>

              <Flex align="center" flex="none" gap={1} padding={1}>
                <MenuButton
                  button={
                    <Button
                      fontSize={1}
                      iconRight={ChevronDownIcon}
                      mode="bleed"
                      padding={2}
                      space={2}
                      text={
                        PERSPECTIVE_TITLES[
                          loadersConnection === 'connected' ? perspective : 'previewDrafts'
                        ]
                      }
                      loading={loadersConnection === 'reconnecting' && iframe.status !== 'loaded'}
                      disabled={loadersConnection !== 'connected'}
                    />
                  }
                  id="perspective-menu"
                  menu={
                    <Menu style={{maxWidth: 240}}>
                      <MenuItem
                        fontSize={1}
                        onClick={() =>
                          dispatch({
                            type: ACTION_PERSPECTIVE,
                            perspective: 'previewDrafts',
                          })
                        }
                        padding={3}
                        pressed={perspective === 'previewDrafts'}
                        tone={PERSPECTIVE_TONES.previewDrafts}
                      >
                        <Flex align="flex-start" gap={3}>
                          <Box flex="none">
                            <Text size={1}>{createElement(PERSPECTIVE_ICONS.previewDrafts)}</Text>
                          </Box>
                          <Stack flex={1} space={2}>
                            <Text size={1} weight="medium">
                              {PERSPECTIVE_TITLES.previewDrafts}
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
                        onClick={() =>
                          dispatch({
                            type: ACTION_PERSPECTIVE,
                            perspective: 'published',
                          })
                        }
                        padding={3}
                        pressed={perspective === 'published'}
                        tone={PERSPECTIVE_TONES.published}
                      >
                        <Flex align="flex-start" gap={3}>
                          <Box flex="none">
                            <Text size={1}>{createElement(PERSPECTIVE_ICONS.published)}</Text>
                          </Box>
                          <Stack flex={1} space={2}>
                            <Text size={1} weight="medium">
                              {PERSPECTIVE_TITLES.published}
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
                  content={
                    <Text size={1}>
                      Switch to {viewport === 'desktop' ? 'narrow' : 'full'} viewport
                    </Text>
                  }
                  fallbackPlacements={['bottom-start']}
                  padding={2}
                  placement="bottom"
                  portal
                >
                  <Button
                    aria-label={`Toggle viewport size`}
                    fontSize={1}
                    icon={viewport === 'desktop' ? MobileDeviceIcon : DesktopIcon}
                    mode="bleed"
                    onClick={setDesktopMode}
                    padding={3}
                    selected={viewport === 'desktop'}
                  />
                </Tooltip>
              </Flex>

              <Flex align="center" flex="none" gap={1}>
                <Tooltip
                  animate
                  content={
                    <Text size={1}>
                      {params.mainDocument ? 'Disable' : 'Enable'} main document mode
                    </Text>
                  }
                  fallbackPlacements={['bottom-start']}
                  padding={2}
                  placement="bottom"
                  portal
                >
                  <Button
                    aria-label="Main document"
                    fontSize={1}
                    icon={DocumentIcon}
                    mode="bleed"
                    onClick={setMobileMode}
                    padding={3}
                    selected={viewport === 'mobile'}
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
              padding={viewport === 'desktop' ? 0 : 2}
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
                      inset: '0',
                      position: 'absolute',
                      backdropFilter: timedOut
                        ? 'blur(16px) saturate(0.5) grayscale(0.5)'
                        : 'blur(2px)',
                      ['transition' as string]: 'backdrop-filter 0.2s ease-in-out',
                      // @TODO Because of Safari we have to do this
                      WebkitBackdropFilter: timedOut
                        ? 'blur(16px) saturate(0.5) grayscale(0.5)'
                        : 'blur(2px)',
                      WebkitTransition: '-webkit-backdrop-filter 0.2s ease-in-out',
                      zIndex: 1,
                    }}
                  >
                    <Flex
                      style={{...sizes[viewport]}}
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
                          style={{opacity: 0}}
                        />
                      )}
                      <Card
                        radius={2}
                        tone={timedOut ? 'caution' : 'inherit'}
                        padding={4}
                        shadow={1}
                      >
                        <Flex justify="center" align="center" direction="column" gap={4}>
                          <Spinner muted />
                          <Text muted size={1}>
                            {timedOut ? (
                              <>
                                Unable to connect, check the browser console for more information.
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
                ) : (loading ||
                    (overlaysConnection === 'connecting' && iframe.status !== 'refreshing')) &&
                  !continueAnyway ? (
                  <MotionFlex
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={spinnerVariants}
                    justify="center"
                    align="center"
                    style={{
                      inset: '0',
                      position: 'absolute',
                      // boxShadow: '0 0 0 1px var(--card-shadow-outline-color)',
                    }}
                  >
                    <Flex
                      style={{...sizes[viewport]}}
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
                      inset: '0',
                      position: 'absolute',
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
                    (loading ||
                      (overlaysConnection === 'connecting' && iframe.status !== 'refreshing')) &&
                    !continueAnyway
                      ? 'none'
                      : 'auto',
                  boxShadow: '0 0 0 1px var(--card-border-color)',
                  borderTop: '1px solid transparent',
                }}
                src={initialUrl.toString()}
                initial={['background']}
                variants={iframeVariants}
                animate={[
                  (loading ||
                    (overlaysConnection === 'connecting' && iframe.status !== 'refreshing')) &&
                  !continueAnyway
                    ? 'background'
                    : 'active',
                  loading ? 'reloading' : 'idle',
                  viewport,
                  showOverlaysConnectionStatus && !continueAnyway ? 'timedOut' : '',
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
  initial: {opacity: 1},
  animate: {opacity: [0, 0, 1]},
  exit: {opacity: [1, 0, 0]},
}

const errorVariants = {
  initial: {opacity: 1},
  animate: {opacity: [0, 0, 1]},
  exit: {opacity: [1, 0, 0]},
}

const iframeVariants = {
  desktop: {
    ...sizes.desktop,
    boxShadow: '0 0 0 0px var(--card-border-color)',
  },
  mobile: {
    ...sizes.mobile,