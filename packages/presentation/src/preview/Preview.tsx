import type {Status} from '@sanity/comlink'
import {
  Button,
  Card,
  Code,
  Flex,
  Label,
  Spinner,
  Stack,
  Text,
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
import {useTranslation} from 'sanity'
import {ErrorCard} from '../components/ErrorCard'
import {MAX_TIME_TO_OVERLAYS_CONNECTION} from '../constants'
import {presentationLocaleNamespace} from '../i18n'
import {
  ACTION_IFRAME_LOADED,
  ACTION_IFRAME_RELOAD,
  type DispatchPresentationAction,
  type PresentationState,
} from '../reducers/presentationReducer'
import type {HeaderOptions, PresentationPerspective, PresentationViewport} from '../types'
import {usePresentationTool} from '../usePresentationTool'
import {IFrame} from './IFrame'
import {usePresentationPreviewHeader} from './PreviewHeader'

const MotionFlex = motion(Flex)

export interface PreviewProps extends Pick<PresentationState, 'iframe' | 'visualEditing'> {
  canSharePreviewAccess: boolean
  canToggleSharePreviewAccess: boolean
  canUseSharedPreviewAccess: boolean
  dispatch: DispatchPresentationAction
  header?: HeaderOptions
  initialUrl: URL
  loadersConnection: Status
  navigatorEnabled: boolean
  onPathChange: (nextPath: string) => void
  onRefresh: (fallback: () => void) => void
  openPopup: (url: string) => void
  overlaysConnection: Status
  perspective: PresentationPerspective
  previewUrl?: string
  setPerspective: (perspective: 'previewDrafts' | 'published') => void
  setViewport: (mode: 'desktop' | 'mobile') => void
  targetOrigin: string
  toggleNavigator?: () => void
  toggleOverlay: () => void
  viewport: PresentationViewport
}

export const Preview = memo(
  forwardRef<HTMLIFrameElement, PreviewProps>(function PreviewComponent(props, forwardedRef) {
    const {dispatch, iframe, header, initialUrl, loadersConnection, overlaysConnection, viewport} =
      props

    const {t} = useTranslation(presentationLocaleNamespace)
    const {devMode} = usePresentationTool()
    const prefersReducedMotion = usePrefersReducedMotion()
    const ref = useRef<HTMLIFrameElement | null>(null)

    const PreviewHeader = usePresentationPreviewHeader({
      ...props,
      iframeRef: ref,
      options: header,
    })

    // Forward the iframe ref to the parent component
    useImperativeHandle<HTMLIFrameElement | null, HTMLIFrameElement | null>(
      forwardedRef,
      () => ref.current,
    )

    const loading = iframe.status === 'loading' || iframe.status === 'reloading'
    const [timedOut, setTimedOut] = useState(false)
    const refreshing = iframe.status === 'refreshing'
    const [somethingIsWrong, setSomethingIsWrong] = useState(false)
    const iframeIsBusy = loading || refreshing || overlaysConnection === 'connecting'

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
    }, [continueAnyway, loading, preventIframeInteraction, showOverlaysConnectionStatus, viewport])

    return (
      <MotionConfig transition={prefersReducedMotion ? {duration: 0} : undefined}>
        <TooltipDelayGroupProvider delay={1000}>
          <PreviewHeader />

          {/* @TODO: Move this to <PreviewFrame /> */}
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
  }),
)
Preview.displayName = 'Memo(ForwardRef(Preview))'

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
