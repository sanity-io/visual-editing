import { createPreviewSecret } from '@sanity/preview-url-secret/create-secret'
import { definePreviewUrl } from '@sanity/preview-url-secret/define-preview-url'
import { useMemo, useState } from 'react'
import {
  SanityClient,
  useActiveWorkspace,
  useClient,
  // useCurrentUser,
} from 'sanity'
import { suspend } from 'suspend-react'

import { PreviewUrlOption } from './types'

export function usePreviewUrl(
  _previewUrl: PreviewUrlOption,
  toolName: string,
  previewSearchParam: string | null,
): URL {
  const client = useClient({ apiVersion: '2023-10-16' })
  const workspace = useActiveWorkspace()
  const basePath = workspace?.activeWorkspace?.basePath
  const workspaceName = workspace?.activeWorkspace?.name || 'default'
  const [previewUrl] = useState(() => _previewUrl)
  // @TODO scope by current user in a better way
  // const currentUser = useCurrentUser()
  const resolvePreviewUrl = useMemo(() => {
    if (typeof previewUrl === 'object') {
      return definePreviewUrl<SanityClient>(previewUrl)
    }
    return previewUrl
  }, [previewUrl])

  const resolvedUrl = suspend(async (): Promise<string> => {
    if (typeof resolvePreviewUrl === 'function') {
      const previewUrlSecret = await createPreviewSecret(
        client,
        '@sanity/presentation',
        typeof window === 'undefined' ? '' : location.href,
        // currentUser?.id,
      )
      return resolvePreviewUrl({
        client,
        previewUrlSecret,
        previewSearchParam,
      })
    }
    return previewSearchParam || resolvePreviewUrl
  }, [
    // Cache based on a few specific conditions
    '@sanity/presentation',
    basePath,
    workspaceName,
    toolName,
    // currentUser?.id,
    resolveUUID,
  ])
  return useMemo(
    () => new URL(resolvedUrl, window.location.origin),
    [resolvedUrl],
  )
}

// https://github.com/pmndrs/suspend-react?tab=readme-ov-file#making-cache-keys-unique
const resolveUUID = Symbol()
