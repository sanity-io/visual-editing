import { createPreviewSecret } from '@sanity/preview-url-secret/create-secret'
import { definePreviewUrl } from '@sanity/preview-url-secret/define-preview-url'
import { useMemo, useState } from 'react'
import { SanityClient, useActiveWorkspace, useClient } from 'sanity'
import { suspend } from 'suspend-react'

import { PreviewUrlOption } from './types'

export function usePreviewUrl(
  _previewUrl: PreviewUrlOption,
  toolName: string,
): string {
  const client = useClient({ apiVersion: '2023-10-16' })
  const workspace = useActiveWorkspace()
  const basePath = workspace?.activeWorkspace?.basePath
  const workspaceName = workspace?.activeWorkspace?.name || 'default'
  const [previewUrl] = useState(() => _previewUrl)
  const resolvePreviewUrl = useMemo(() => {
    if (typeof previewUrl === 'object') {
      return definePreviewUrl<SanityClient>(previewUrl)
    }
    return previewUrl
  }, [previewUrl])

  return suspend(async (): Promise<string> => {
    if (typeof resolvePreviewUrl === 'function') {
      const previewUrlSecret = await createPreviewSecret()
      const searchParams =
        typeof document === 'undefined'
          ? new URLSearchParams()
          : new URLSearchParams(document.location.search)
      return resolvePreviewUrl({
        client,
        previewUrlSecret,
        previewSearchParam: searchParams.get('preview'),
      })
    }
    return resolvePreviewUrl
  }, [
    // Cache based on a few specific conditions
    '@sanity/presentation',
    basePath,
    workspaceName,
    toolName,
    resolveUUID,
  ])
}

// https://github.com/pmndrs/suspend-react?tab=readme-ov-file#making-cache-keys-unique
const resolveUUID = Symbol()
