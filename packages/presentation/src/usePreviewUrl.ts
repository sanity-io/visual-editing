import { createPreviewSecret } from '@sanity/preview-url-secret/create-secret'
import { definePreviewUrl } from '@sanity/preview-url-secret/define-preview-url'
import { useMemo, useState } from 'react'
import {
  SanityClient,
  useActiveWorkspace,
  useClient,
  useCurrentUser,
} from 'sanity'
import { suspend } from 'suspend-react'

import { PreviewUrlOption } from './types'

export function usePreviewUrl(
  _previewUrl: PreviewUrlOption,
  toolName: string,
  _previewSearchParam: string | null,
): URL {
  const client = useClient({ apiVersion: '2023-10-16' })
  const [previewUrl] = useState(() => _previewUrl)
  const currentUser = useCurrentUser()
  const resolvePreviewUrl = useMemo(() => {
    if (typeof previewUrl === 'object') {
      return definePreviewUrl<SanityClient>(previewUrl)
    }
    return previewUrl
  }, [previewUrl])
  const [previewSearchParam] = useState(() => {
    if (typeof resolvePreviewUrl !== 'string' || !_previewSearchParam) {
      return null
    }
    return new URL(
      _previewSearchParam,
      new URL(resolvePreviewUrl, location.origin),
    )
  })

  const resolveUrlDeps = usePreviewUrlSecretDependencies(
    toolName,
    currentUser?.id,
  )
  const resolvedUrl =
    typeof resolvePreviewUrl === 'function'
      ? suspend(async (): Promise<string> => {
          const { secret: previewUrlSecret } = await createPreviewSecret(
            client,
            '@sanity/presentation',
            typeof window === 'undefined' ? '' : location.href,
            currentUser?.id,
          )
          return resolvePreviewUrl({
            client,
            previewUrlSecret,
            previewSearchParam: _previewSearchParam,
          })
        }, resolveUrlDeps)
      : previewSearchParam || resolvePreviewUrl

  return useMemo(() => new URL(resolvedUrl, location.origin), [resolvedUrl])
}

function usePreviewUrlSecretDependencies(
  toolName: string,
  currentUserId?: string,
) {
  const workspace = useActiveWorkspace()
  const basePath = workspace?.activeWorkspace?.basePath
  const workspaceName = workspace?.activeWorkspace?.name || 'default'
  return [
    // Cache based on a few specific conditions
    '@sanity/presentation',
    basePath,
    workspaceName,
    toolName,
    currentUserId,
    resolveUUID,
  ]
}

// https://github.com/pmndrs/suspend-react?tab=readme-ov-file#making-cache-keys-unique
const resolveUUID = Symbol()
