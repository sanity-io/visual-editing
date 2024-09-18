import {schemaIdPrefix, schemaIdSingleton, schemaType} from '@sanity/preview-url-secret/constants'
import {useToast} from '@sanity/ui'
import {uuid} from '@sanity/uuid'
import {useEffect, useState, type ReactElement} from 'react'
import {useGrantsStore, useTranslation, type PermissionCheckResult, type Tool} from 'sanity'
import {presentationLocaleNamespace} from './i18n'
import {PresentationSpinner} from './PresentationSpinner'
import PresentationTool from './PresentationTool'
import type {PresentationPluginOptions} from './types'

export default function PresentationToolGrantsCheck(props: {
  tool: Tool<PresentationPluginOptions>
}): ReactElement {
  const {t} = useTranslation(presentationLocaleNamespace)
  const {previewUrl} = props.tool.options ?? {}
  const {push: pushToast} = useToast()
  const willGeneratePreviewUrlSecret =
    typeof previewUrl === 'object' || typeof previewUrl === 'function'
  const grantsStore = useGrantsStore()
  const [draftPermission, setDraftPermission] = useState<PermissionCheckResult | null>(null)
  const [previewUrlSecretPermission, setPreviewUrlSecretPermission] =
    useState<PermissionCheckResult | null>(null)

  useEffect(() => {
    if (!willGeneratePreviewUrlSecret) return undefined

    const draftPermissionSubscription = grantsStore
      .checkDocumentPermission('create', {_id: schemaIdSingleton, _type: schemaType})
      .subscribe(setDraftPermission)
    const previewUrlSecretPermissionSubscription = grantsStore
      .checkDocumentPermission('create', {_id: `${schemaIdPrefix}.${uuid()}`, _type: schemaType})
      .subscribe(setPreviewUrlSecretPermission)

    return () => {
      draftPermissionSubscription.unsubscribe()
      previewUrlSecretPermissionSubscription.unsubscribe()
    }
  }, [grantsStore, willGeneratePreviewUrlSecret])

  const canCreateUrlPreviewSecrets = draftPermission?.granted && previewUrlSecretPermission?.granted

  useEffect(() => {
    if (!willGeneratePreviewUrlSecret || canCreateUrlPreviewSecrets !== false) return undefined
    const raf = requestAnimationFrame(() =>
      pushToast({
        closable: true,
        status: 'error',
        duration: 30_000,
        title: t('preview-url-secret.missing-grants'),
      }),
    )
    return () => cancelAnimationFrame(raf)
  }, [canCreateUrlPreviewSecrets, pushToast, t, willGeneratePreviewUrlSecret])

  if (
    willGeneratePreviewUrlSecret &&
    (!draftPermission ||
      typeof draftPermission.granted === 'undefined' ||
      !previewUrlSecretPermission ||
      typeof previewUrlSecretPermission.granted === 'undefined')
  ) {
    return <PresentationSpinner />
  }

  return <PresentationTool {...props} canCreateUrlPreviewSecrets={canCreateUrlPreviewSecrets!} />
}
