import type {Status} from '@sanity/comlink'
import {DesktopIcon, MobileDeviceIcon, PanelLeftIcon, RefreshIcon} from '@sanity/icons'
import {withoutSecretSearchParams} from '@sanity/preview-url-secret/without-secret-search-params'
import {
  Box,
  Button,
  Card,
  Code,
  Flex,
  Label,
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
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {Hotkeys, useTranslation} from 'sanity'
import {ErrorCard} from '../components/ErrorCard'
import {MAX_TIME_TO_OVERLAYS_CONNECTION} from '../constants'
import {presentationLocaleNamespace} from '../i18n'
import {
  ACTION_IFRAME_LOADED,
  ACTION_IFRAME_RELOAD,
  type DispatchPresentationAction,
  type PresentationState,
} from '../reducers/presentationReducer'
import type {PresentationPerspective, PresentationViewport} from '../types'
import {usePresentationTool} from '../usePresentationTool'
import {IFrame} from './IFrame'
import {OpenPreviewButton} from './OpenPreviewButton'
import {PreviewLocationInput} from './PreviewLocationInput'
import {SharePreviewMenu} from './SharePreviewMenu'

const MotionFlex = motion(Flex)

export interface PreviewFrameProps extends Pick<PresentationState, 'iframe' | 'visualEditing'> {
  canSharePreviewAccess: boolean
  canToggleSharePreviewAccess: boolean
  canUseSharedPreviewAccess: boolean
  dispatch: DispatchPresentationAction
  initialUrl: URL
  loadersConnection: Status
  navigatorEnabled: boolean
  onPathChange: (nextPath: string) => void
  onRefresh: (fallback: () => void) => void
  openPopup: (url: string) => void
  overlaysConnection: Status
  perspective: PresentationPerspective
  previewUrl?: string
  setViewport: (mode: 'desktop' | 'mobile') => void
  targetOrigin: string
  toggleNavigator?: () => void
  toggleOverlay: () => void
  viewport: PresentationViewport
}

export const PreviewFrame = memo(
  forwardRef<HTMLIFrameElement, PreviewFrameProps>(
    function PreviewFrameComponent(props, forwardedRef) {
      const {
        canSharePreviewAccess,
        canToggleSharePreviewAccess,
        canUseSharedPreviewAccess,
        dispatch,
        iframe,
        initialUrl,
        loadersConnection,
        navigatorEnabled,
        onPathChange,
        onRefresh,
        openPopup,
        overlaysConnection,
        perspective,
        previewUrl,
        setViewport,
        targetOrigin,
        toggleNavigator,
        toggleOverlay,
        viewport,
        visualEditing: {overlaysEnabled},
      } = props

      const {t} = useTranslation(presentationLocaleNamespace)
      const {devMode} = usePresentationTool()
      const prefersReducedMotion = usePrefersReducedMotion()
      const ref = useRef<HTMLIFrameElement | null>(null)

      // Forward the iframe ref to the parent component
      useImperativeHandle<HTMLIFrameElement | null, HTMLIFrameElement | null>(
        forwardedRef,
        () => ref.current,
      )

      const toggleViewportSize = useCallback(
        () => setViewport(viewport === 'desktop' ? 'mobile' : 'desktop'),
        [setViewport, viewport],
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
          if (!ref.current) {
            return
          }
          dispatch({type: ACTION_IFRAME_RELOAD})
          // Funky way to reload an iframe without CORS issues
          // eslint-disable-next-line no-self-assign
          // ref.current.src = ref.current.src
          ref.current.src = `${targetOrigin}${previewUrl || '/'}`
        })
      }, [dispatch, onRefresh, previewUrl, targetOrigin])
      const handleRetry = useCallback(() => {
        if (!ref.current) {
          return
        }

        ref.current.src = initialUrl.toString()

        dispatch({type: ACTION_IFRAME_RELOAD})
      }, [dispatch, initialUrl])
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
          }, 5_000)
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
        const previewURL = new URL(previewUrl || '/', targetOrigin)
        const {pathname, search} = withoutSecretSearchParams(previewURL)

        return `${pathname}${search}`
      }, [previewUrl, targetOrigin])

      const onIFrameLoad = useCallback(() => {
        dispatch({type: ACTION_IFRAME_LOADED})
      }, [dispatch])

      /**
       * Ensure that clicking outside of menus and dialogs will close as focus shifts to the iframe
       */
      useEffect(() => {
        if (!ref.current) {
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
      }, [])

      const preventIframeInteraction = useMemo(() => {
        return (
          (loading || (overlaysConnection === 'connecting' && iframe.status !== 'refreshing')) &&
          !continueAnyway
        )
      }, [continueAnyway, iframe.status, loading, overlaysConnection])

      const iframeAnimations = useMemo(() => {
        return [
          preventIframeInteraction ? 'background' : 'active',
          loading ? 'reloading' : 'idle',
          viewport,
          showOverlaysConnectionStatus && !continueAnyway ? 'timedOut' : '',
        ]
      }, [
        continueAnyway,
        loading,
        preventIframeInteraction,
        showOverlaysConnectionStatus,
        viewport,
      ])

      return (
        <MotionConfig transition={prefersReducedMotion ? {duration: 0} : undefined}>
          <TooltipDelayGroupProvider delay={1000}>
            <Card flex="none" padding={2} shadow={1} style={{position: 'relative'}}>
              <Flex align="center" style={{minHeight: 0}}>
                {toggleNavigator && (
                  <Box flex="none" marginRight={1} padding={1}>
                    <Tooltip
                      animate
                      content={
                        <Text size={1}>{t('preview-frame.navigator.toggle-button.tooltip')}</Text>
                      }
                      fallbackPlacements={['bottom-start']}
                      padding={2}
                      placement="bottom"
                      portal
                    >
                      <Button
                        aria-label={t('preview-frame.navigator.toggle-button.aria-label')}
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
                          {t('preview-frame.overlay.toggle-button.tooltip', {
                            context: overlaysEnabled ? 'disable' : 'enable',
                          })}
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
                          disabled={
                            iframe.status === 'loading' || overlaysConnection !== 'connected'
                          }
                        />
                      </div>
                      <Box>
                        <Text muted={!overlaysEnabled} size={1} weight="medium">
                          {t('preview-frame.overlay.toggle-button.text')}
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
                              {iframe.status === 'loaded'
                                ? t('preview-frame.refresh-button.tooltip')
                                : t('preview-frame.status', {context: iframe.status})}
                            </Text>
                          }
                          fallbackPlacements={['bottom-end']}
                          padding={2}
                          placement="bottom"
                          portal
                        >
                          <Button
                            aria-label={t('preview-frame.refresh-button.aria-label')}
                            fontSize={1}
                            icon={RefreshIcon}
                            mode="bleed"
                            loading={
                              iframe.status === 'reloading' || iframe.status === 'refreshing'
                            }
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
                        <OpenPreviewButton
                          openPopup={openPopup}
                          previewLocationOrigin={previewLocationOrigin}
                          previewLocationRoute={previewLocationRoute}
                        />
                      </Box>
                    }
                    value={previewLocationRoute}
                  />
                </Box>

                <Flex align="center" flex="none" gap={1}>
                  <Tooltip
                    animate
                    content={
                      <Text size={1}>
                        {t('preview-frame.viewport-button.tooltip', {
                          context: viewport === 'desktop' ? 'narrow' : 'full',
                        })}
                      </Text>
                    }
                    fallbackPlacements={['bottom-start']}
                    padding={2}
                    placement="bottom"
                    portal
                  >
                    <Button
                      aria-label={t('preview-frame.viewport-button.aria-label')}
                      fontSize={1}
                      icon={viewport === 'desktop' ? MobileDeviceIcon : DesktopIcon}
                      mode="bleed"
                      onClick={toggleViewportSize}
                      padding={2}
                    />
                  </Tooltip>
                </Flex>

                {canSharePreviewAccess && (
                  <Flex align="center" flex="none" gap={1} paddingX={1}>
                    <SharePreviewMenu
                      canToggleSharePreviewAccess={canToggleSharePreviewAccess}
                      canUseSharedPreviewAccess={canUseSharedPreviewAccess}
                      previewLocationRoute={previewLocationRoute}
                      initialUrl={initialUrl}
                      perspective={perspective}
                    />
                  </Flex>
                )}
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
                            text={t('preview-frame.continue-button.text')}
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
                              {timedOut
                                ? t('preview-frame.status', {context: 'timeout'})
                                : t('preview-frame.status', {context: 'connecting'})}
                            </Text>
                          </Flex>
                        </Card>
                        {timedOut && (
                          <Button
                            fontSize={1}
                            // mode="ghost"
                            tone="critical"
                            onClick={handleContinueAnyway}
                            text={t('preview-frame.continue-button.text')}
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
                          {t('preview-frame.status', {context: 'loading'})}
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
                        message={t('preview-frame.connection.error.text')}
                        onRetry={handleRetry}
                        onContinueAnyway={handleContinueAnyway}
                      >
                        {devMode && (
                          <>
                            {overlaysConnection !== 'connected' && (
                              <Card padding={3} radius={2} tone="critical">
                                <Stack space={3}>
                                  <Label muted size={0}>
                                    {t('preview-frame.overlay.connection-status.label')}
                                  </Label>
                                  <Code size={1}>
                                    {t('channel.status', {context: overlaysConnection})}
                                  </Code>
                                </Stack>
                              </Card>
                            )}

                            {loadersConnection !== 'connected' && (
                              <Card padding={3} radius={2} tone="critical">
                                <Stack space={3}>
                                  <Label muted size={0}>
                                    {t('preview-frame.loader.connection-status.label')}
                                  </Label>
                                  <Code size={1}>
                                    {t('channel.status', {context: loadersConnection})}
                                  </Code>
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
                  animate={iframeAnimations}
                  initial={['background']}
                  onLoad={onIFrameLoad}
                  preventClick={preventIframeInteraction}
                  ref={ref}
                  src={initialUrl.toString()}
                  variants={iframeVariants}
                />
              </Flex>
            </Card>
          </TooltipDelayGroupProvider>
        </MotionConfig>
      )
    },
  ),
)
PreviewFrame.displayName = 'Memo(ForwardRef(PreviewFrame))'

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
