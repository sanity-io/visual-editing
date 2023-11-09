import { createPreviewSecret } from '@sanity/preview-url-secret/create-secret'
import { useActiveWorkspace, useClient } from 'sanity'
import { suspend } from 'suspend-react'

import { PreviewUrlResolver } from './types'

export function usePreviewUrl(
  resolvePreviewUrl: string | PreviewUrlResolver,
  toolName: string,
): string {
  const client = useClient({ apiVersion: '2023-10-16' })
  const workspace = useActiveWorkspace()
  const basePath = workspace?.activeWorkspace?.basePath
  const workspaceName = workspace?.activeWorkspace?.name || 'default'

  return suspend(async (): Promise<string> => {
    if (typeof resolvePreviewUrl === 'function') {
      const previewUrlSecret = await createPreviewSecret()
      return resolvePreviewUrl({ client, previewUrlSecret })
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
