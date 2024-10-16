import {EarthGlobeIcon, LaunchIcon} from '@sanity/icons'
import {MenuItem} from '@sanity/ui'
import {useCallback} from 'react'
import {useTranslation} from 'sanity'
import {presentationLocaleNamespace} from '../i18n'
import type {PreviewFrameProps} from './PreviewFrame'

/** @internal */
export function ShareUrlMenuItemsWithQRCode(
  props: Pick<PreviewFrameProps, 'openPopup'> & {
    previewLocationOrigin: string
    previewLocationRoute: string
    handleShareUrlDialogOpen: () => void
  },
): React.ReactNode {
  const {openPopup, previewLocationOrigin, previewLocationRoute, handleShareUrlDialogOpen} = props

  const {t} = useTranslation(presentationLocaleNamespace)

  const handleOpenPopup = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault()
      openPopup(event.currentTarget.href)
    },
    [openPopup],
  )

  return (
    <>
      <CopyUrlMenuButton handleShareUrlDialogOpen={handleShareUrlDialogOpen} />
      <MenuItem
        icon={LaunchIcon}
        text={t('share-url.menu-item.open.text')}
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

function CopyUrlMenuButton(props: {handleShareUrlDialogOpen: () => void}) {
  const {handleShareUrlDialogOpen} = props

  const {t} = useTranslation(presentationLocaleNamespace)

  return (
    <MenuItem
      onClick={handleShareUrlDialogOpen}
      text={t('share-url.menu-item.share.text')}
      icon={EarthGlobeIcon}
    />
  )
}
