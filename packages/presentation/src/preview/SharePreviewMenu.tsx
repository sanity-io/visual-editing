import {CopyIcon, ShareIcon} from '@sanity/icons'
import {createPreviewSecret} from '@sanity/preview-url-secret/create-secret'
import {setSecretSearchParams} from '@sanity/preview-url-secret/without-secret-search-params'
import {
  Box,
  Button,
  Card,
  Grid,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  Stack,
  Switch,
  Text,
  Tooltip,
  useToast,
} from '@sanity/ui'
import {QRCodeSVG} from 'qrcode.react'
import {memo, useCallback, useState} from 'react'
import {useClient, useCurrentUser, useTranslation} from 'sanity'
import {API_VERSION} from '../constants'
import {presentationLocaleNamespace} from '../i18n'
import type {PreviewFrameProps} from './PreviewFrame'

export interface SharePreviewMenuProps {
  previewLocationRoute: string
  initialUrl: PreviewFrameProps['initialUrl']
  perspective: string
}

// @TODO embed the logo instead of using the network
const qrCodeLogo = 'https://www.sanity.io/static/images/logo_rounded_square.png'
// const qrCodeLogo = 'https://www.sanity.io/static/images/favicons/safari-pinned-tab.svg'
// const qrCodeLogo = 'https://www.sanity.io/static/images/favicons/favicon-96x96.png'

export const SharePreviewMenu = memo(function SharePreviewMenuComponent(
  props: SharePreviewMenuProps,
) {
  const {initialUrl, previewLocationRoute, perspective} = props
  const {t} = useTranslation(presentationLocaleNamespace)
  const {push: pushToast} = useToast()
  const client = useClient({apiVersion: API_VERSION})
  const currentUser = useCurrentUser()
  const [enabling, setEnabling] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [url, setUrl] = useState<URL | null>(null)
  const busy = enabling || disabling

  const [error, setError] = useState<unknown>(null)
  if (error) {
    throw error
  }

  // const handleClose = useCallback(() => {
  //   if (busy) {
  //     // eslint-disable-next-line no-console
  //     console.warn('Show a toast here instead, and delay closing the dialog')
  //   } else {
  //     onClose()
  //   }
  // }, [busy, onClose])

  const handleDisableSharing = useCallback(async () => {
    try {
      setDisabling(true)
      // await revokePreviewSecret(client, '@sanity/presentation', url.searchParams.get('secret'))
      pushToast({
        closable: true,
        status: 'warning',
        title: `This isn't implemented yet. The link expires automatically after 1 hour.`,
      })
      await new Promise((resolve) => setTimeout(resolve, 2_000))
      setUrl(null)
    } catch (error) {
      setError(error)
    } finally {
      setDisabling(false)
    }
  }, [pushToast])
  const handleEnableSharing = useCallback(async () => {
    try {
      setEnabling(true)

      // Preload the qr code logo
      const qrCodeLogoImage = new Image()
      qrCodeLogoImage.src = qrCodeLogo

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
        perspective,
      )
      setUrl(newUrl)
    } catch (error) {
      setError(error)
    } finally {
      setEnabling(false)
    }
  }, [client, currentUser?.id, initialUrl, perspective, previewLocationRoute])

  const handleCopyUrl = useCallback(() => {
    try {
      if (!url) {
        throw new Error('No URL to copy')
      }
      navigator.clipboard.writeText(url.toString())
      pushToast({
        closable: true,
        status: 'success',
        title: t('share-url.clipboard.status', {context: 'success'}),
      })
    } catch (error) {
      setError(error)
    }
  }, [pushToast, t, url])

  return (
    <Tooltip
      animate
      content={<Text size={1}>{t('preview-frame.share-button.tooltip')}</Text>}
      fallbackPlacements={['bottom-start']}
      padding={2}
      placement="bottom"
      portal
    >
      <MenuButton
        button={
          <Button
            aria-label={t('preview-frame.share-button.aria-label')}
            fontSize={1}
            icon={ShareIcon}
            mode="bleed"
            padding={2}
          />
        }
        id="share-menu"
        menu={
          <Menu style={{maxWidth: 240}}>
            <Grid
              columns={2}
              rows={2}
              gapX={3}
              gapY={1}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                gridTemplateColumns: 'min-content 1fr',
              }}
              padding={2}
            >
              <Switch
                checked={!!url}
                onChange={url ? handleDisableSharing : handleEnableSharing}
                disabled={busy}
              />
              <Text size={1} weight="medium">
                Share this preview
              </Text>
              <span />
              <Text muted size={1}>
                with anyone who has the link
              </Text>
            </Grid>
            <Box padding={3} paddingTop={0}>
              <Stack space={2}>
                {url ? (
                  <Card tone="transparent" radius={2} padding={1} style={{aspectRatio: '1 / 1'}}>
                    <QRCodeSVG
                      value={url.toString()}
                      size={206}
                      bgColor="var(--card-bg-color)"
                      fgColor="var(--card-fg-color)"
                      imageSettings={{
                        src: qrCodeLogo,
                        height: 36,
                        width: 36,
                        excavate: true,
                      }}
                    />
                  </Card>
                ) : null}
                <Text muted size={1}>
                  Scan the QR Code to open the preview on your phone.
                </Text>
              </Stack>
            </Box>
            <MenuDivider />
            <MenuItem
              icon={CopyIcon}
              onClick={handleCopyUrl}
              fontSize={1}
              padding={3}
              text={t('share-url.menu-item.copy.text')}
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
    </Tooltip>
  )
})
SharePreviewMenu.displayName = 'Memo(SharePreviewMenu)'
