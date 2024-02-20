import { CopyIcon, LaunchIcon } from '@sanity/icons'
import { createPreviewSecret } from '@sanity/preview-url-secret/create-secret'
import {
  hasSecretSearchParams,
  setSecretSearchParams,
} from '@sanity/preview-url-secret/without-secret-search-params'
import { MenuItem, useToast } from '@sanity/ui'
import { useCallback, useState } from 'react'
import { useClient, useCurrentUser } from 'sanity'

import { API_VERSION } from '../constants'
import type { PreviewFrameProps } from './PreviewFrame'

/** @internal */
export function ShareUrlMenuItems(
  props: Pick<PreviewFrameProps, 'initialUrl' | 'openPopup'> & {
    previewLocationOrigin: string
    previewLocationRoute: string
  },
): React.ReactNode {
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
        // @ts-expect-error the `as="a"` prop isn't enough to change the type of event.target from <div> to <a>
        onClick={handleOpenPopup}
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
        const onError = (error: Error) => {
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
