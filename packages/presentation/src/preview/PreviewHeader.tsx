import {
  CheckmarkIcon,
  ChevronDownIcon,
  DesktopIcon,
  EditIcon,
  MobileDeviceIcon,
  PanelLeftIcon,
  PublishIcon,
  RefreshIcon,
} from '@sanity/icons'
import {withoutSecretSearchParams} from '@sanity/preview-url-secret/without-secret-search-params'
import {
  Box,
  Button,
  Card,
  Flex,
  Hotkeys,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Switch,
  Text,
  Tooltip,
  type ButtonTone,
} from '@sanity/ui'
import {
  createElement,
  useCallback,
  useMemo,
  type ComponentType,
  type FunctionComponent,
  type ReactNode,
  type RefObject,
} from 'react'
import {useTranslation} from 'sanity'
import {presentationLocaleNamespace} from '../i18n'
import {ACTION_IFRAME_RELOAD} from '../reducers/presentationReducer'
import type {HeaderOptions, PresentationPerspective} from '../types'
import {OpenPreviewButton} from './OpenPreviewButton'
import type {PreviewProps} from './Preview'
import {PreviewLocationInput} from './PreviewLocationInput'
import {SharePreviewMenu} from './SharePreviewMenu'

const PERSPECTIVE_TITLE_KEY: Record<PresentationPerspective, string> = {
  previewDrafts: 'preview-frame.perspective.previewDrafts.title',
  published: 'preview-frame.perspective.published.title',
}

const PERSPECTIVE_TONES: Record<PresentationPerspective, ButtonTone> = {
  previewDrafts: 'caution',
  published: 'positive',
}

const PERSPECTIVE_ICONS: Record<PresentationPerspective, ComponentType> = {
  previewDrafts: EditIcon,
  published: PublishIcon,
}

export interface PreviewHeaderProps extends PreviewProps {
  iframeRef: RefObject<HTMLIFrameElement>
}

const PreviewHeaderDefault: FunctionComponent<PreviewHeaderProps> = (props) => {
  const {
    canSharePreviewAccess,
    canToggleSharePreviewAccess,
    canUseSharedPreviewAccess,
    dispatch,
    iframe,
    iframeRef,
    initialUrl,
    loadersConnection,
    navigatorEnabled,
    onPathChange,
    onRefresh,
    openPopup,
    overlaysConnection,
    perspective,
    previewUrl,
    setPerspective,
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

  const handleRefresh = useCallback(() => {
    onRefresh(() => {
      if (!iframeRef.current) {
        return
      }
      dispatch({type: ACTION_IFRAME_RELOAD})
      // Funky way to reload an iframe without CORS issues
      // eslint-disable-next-line no-self-assign
      // ref.current.src = ref.current.src
      iframeRef.current.src = `${targetOrigin}${previewUrl || '/'}`
    })
  }, [dispatch, onRefresh, previewUrl, targetOrigin, iframeRef])

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

      <Flex align="center" flex="none" gap={1} padding={1}>
        <MenuButton
          button={
            <Button
              fontSize={1}
              iconRight={ChevronDownIcon}
              mode="bleed"
              padding={2}
              space={2}
              text={t(
                PERSPECTIVE_TITLE_KEY[
                  loadersConnection === 'connected' ? perspective : 'previewDrafts'
                ],
              )}
              loading={loadersConnection === 'reconnecting' && iframe.status !== 'loaded'}
              disabled={loadersConnection !== 'connected'}
            />
          }
          id="perspective-menu"
          menu={
            <Menu style={{maxWidth: 240}}>
              <MenuItem
                fontSize={1}
                onClick={() => setPerspective('previewDrafts')}
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
                      {t(PERSPECTIVE_TITLE_KEY['previewDrafts'])}
                    </Text>
                    <Text muted size={1}>
                      {t('preview-frame.perspective.previewDrafts.text')}
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
                tone={PERSPECTIVE_TONES.published}
              >
                <Flex align="flex-start" gap={3}>
                  <Box flex="none">
                    <Text size={1}>{createElement(PERSPECTIVE_ICONS.published)}</Text>
                  </Box>
                  <Stack flex={1} space={2}>
                    <Text size={1} weight="medium">
                      {t(PERSPECTIVE_TITLE_KEY['published'])}
                    </Text>
                    <Text muted size={1}>
                      {t('preview-frame.perspective.published.text')}
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
    </>
  )
}

const PreviewHeader: FunctionComponent<PreviewHeaderProps & {options?: HeaderOptions}> = (
  props,
) => {
  const renderDefault = useCallback((props: PreviewHeaderProps) => {
    return createElement(PreviewHeaderDefault, props)
  }, [])

  const header = props.options?.component
    ? createElement(props.options.component, {...props, renderDefault})
    : renderDefault(props)

  return (
    <Card flex="none" padding={2} shadow={1} style={{position: 'relative'}}>
      <Flex align="center" style={{minHeight: 0}}>
        {header}
      </Flex>
    </Card>
  )
}

/** @internal */
export function usePresentationPreviewHeader(
  props: PreviewHeaderProps & {options?: HeaderOptions},
): () => ReactNode {
  const Component = useCallback(() => {
    return <PreviewHeader {...props} />
  }, [props])

  return Component
}
