import {DesktopIcon, MobileDeviceIcon, PanelLeftIcon, RefreshIcon} from '@sanity/icons'
import {withoutSecretSearchParams} from '@sanity/preview-url-secret/without-secret-search-params'
import {Box, Button, Card, Flex, Hotkeys, Switch, Text, Tooltip} from '@sanity/ui'
import {
  createElement,
  useCallback,
  useMemo,
  type FunctionComponent,
  type ReactNode,
  type RefObject,
} from 'react'
import {useTranslation} from 'sanity'
import {presentationLocaleNamespace} from '../i18n'
import {ACTION_IFRAME_RELOAD} from '../reducers/presentationReducer'
import type {HeaderOptions} from '../types'
import {OpenPreviewButton} from './OpenPreviewButton'
import type {PreviewProps} from './Preview'
import {PreviewLocationInput} from './PreviewLocationInput'
import {SharePreviewMenu} from './SharePreviewMenu'

export interface PreviewHeaderProps extends PreviewProps {
  iframeRef: RefObject<HTMLIFrameElement>
  renderDefault: (props: PreviewHeaderProps) => ReactNode
}

const PreviewHeaderDefault: FunctionComponent<Omit<PreviewHeaderProps, 'renderDefault'>> = (
  props,
) => {
  const {
    canSharePreviewAccess,
    canToggleSharePreviewAccess,
    canUseSharedPreviewAccess,
    dispatch,
    iframe,
    iframeRef,
    initialUrl,
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

  const toggleViewportSize = useCallback(
    () => setViewport(viewport === 'desktop' ? 'mobile' : 'desktop'),
    [setViewport, viewport],
  )

  const previewLocationOrigin = useMemo(() => {
    return targetOrigin === location.origin ? '' : targetOrigin
  }, [targetOrigin])

  const handleRefresh = () => {
    onRefresh(() => {
      if (!iframeRef.current) {
        return
      }
      dispatch({type: ACTION_IFRAME_RELOAD})
      // Funky way to reload an iframe without CORS issues
      // eslint-disable-next-line no-self-assign
      // ref.current.src = ref.current.src
      Object.assign(iframeRef.current, {src: `${targetOrigin}${previewUrl || '/'}`})
    })
  }

  const previewLocationRoute = useMemo(() => {
    const previewURL = new URL(previewUrl || '/', targetOrigin)
    const {pathname, search} = withoutSecretSearchParams(previewURL)

    return `${pathname}${search}`
  }, [previewUrl, targetOrigin])

  return (
    <>
      {toggleNavigator && (
        <Box flex="none" marginRight={1} padding={1}>
          <Tooltip
            animate
            content={<Text size={1}>{t('preview-frame.navigator.toggle-button.tooltip')}</Text>}
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
                disabled={iframe.status === 'loading' || overlaysConnection !== 'connected'}
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
            // @ts-expect-error - this is fine
            perspective={perspective}
          />
        </Flex>
      )}
    </>
  )
}

const PreviewHeader: FunctionComponent<
  Omit<PreviewHeaderProps, 'renderDefault'> & {options?: HeaderOptions}
> = (props) => {
  const renderDefault = useCallback((props: Omit<PreviewHeaderProps, 'renderDefault'>) => {
    return createElement(PreviewHeaderDefault, props)
  }, [])

  const header = props.options?.component
    ? createElement(props.options.component, {...props, renderDefault})
    : renderDefault(props)

  return (
    <Card flex="none" padding={2} borderBottom style={{position: 'relative'}}>
      <Flex align="center" style={{minHeight: 0}}>
        {header}
      </Flex>
    </Card>
  )
}

/** @internal */
export function usePresentationPreviewHeader(
  props: Omit<PreviewHeaderProps, 'renderDefault'> & {options?: HeaderOptions},
): () => ReactNode {
  const Component = useCallback(() => {
    return <PreviewHeader {...props} />
  }, [props])

  return Component
}
