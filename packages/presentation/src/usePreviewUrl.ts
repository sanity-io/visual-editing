import {createPreviewSecret} from '@sanity/preview-url-secret/create-secret'
import {definePreviewUrl} from '@sanity/preview-url-secret/define-preview-url'
import {startTransition, useEffect, useMemo, useRef, useState} from 'react'
import {type SanityClient, useClient, useCurrentUser} from 'sanity'
import {suspend} from 'suspend-react'

import {API_VERSION} from './constants'
import {useActiveWorkspace} from './internals'
import type {PreviewUrlOption} from './types'

export function usePreviewUrl(
  previewUrl: PreviewUrlOption,
  toolName: string,
  previewSearchParam: string | null,
): URL {
  const client = useClient({apiVersion: API_VERSION})
  const workspace = useActiveWorkspace()
  const basePath = workspace?.activeWorkspace?.basePath || '/'
  const workspaceName = workspace?.activeWorkspace?.name || 'default'
  const deps = useSuspendCacheKeys(toolName, basePath, workspaceName, previewSearchParam)
  const previewUrlSecret = usePreviewUrlSecret(
    typeof previewUrl === 'object' || typeof previewUrl === 'function',
    deps,
  )

  return suspend(async () => {
    if (typeof previewUrl === 'string') {
      const resolvedUrl = new URL(previewUrl, location.origin)
      let resultUrl = resolvedUrl
      try {
        if (previewSearchParam) {
          const restoredUrl = new URL(previewSearchParam, resolvedUrl)
          if (restoredUrl.origin === resolvedUrl.origin) {
            resultUrl = restoredUrl
          }
        } else if (document.referrer) {
          const referrerUrl = new URL(document.referrer)
          if (referrerUrl.origin === resolvedUrl.origin) {
            resultUrl = referrerUrl
          }
        }
      } catch {
        // ignore
      }
      // Prevent infinite recursion
      if (
        location.origin === resultUrl.origin &&
        (resultUrl.pathname.startsWith(`${basePath}/`) || resultUrl.pathname === basePath)
      ) {
        return resolvedUrl
      }
      return resultUrl
    }
    const resolvePreviewUrl =
      typeof previewUrl === 'object' ? definePreviewUrl<SanityClient>(previewUrl) : previewUrl
    const resolvedUrl = await resolvePreviewUrl({
      client,
      previewUrlSecret: previewUrlSecret!,
      previewSearchParam,
      referrer: typeof document === 'undefined' ? null : document.referrer,
      studioBasePath: basePath,
    })
    return new URL(resolvedUrl, location.origin)
  }, [...deps, previewUrlSecret]) satisfies URL
}

// https://github.com/pmndrs/suspend-react?tab=readme-ov-file#making-cache-keys-unique
const resolveUUID = Symbol()

function useSuspendCacheKeys(
  toolName: string,
  basePath: string,
  workspaceName: string,
  previewSearchParam: string | null,
) {
  // Allow busting the cache when the Presentation Tool is reloaded, without causing it to suspend on every render that changes the `preview` parameter
  const [cachedPreviewSearchParam, setCachedPreviewSearchParam] = useState(
    () => previewSearchParam || '',
  )
  const timeoutRef = useRef(0)
  useEffect(() => {
    if (cachedPreviewSearchParam && previewSearchParam) {
      // Handle resets, like when the Presentation Tool is clicked in the navbar
      window.clearTimeout(timeoutRef.current)
      return () => {
        timeoutRef.current = window.setTimeout(() => {
          setCachedPreviewSearchParam('')
        }, 100)
      }
    }
    return
  }, [cachedPreviewSearchParam, previewSearchParam])

  const currentUser = useCurrentUser()
  return useMemo(
    () => [
      // Cache based on a few specific conditions
      '@sanity/presentation',
      basePath,
      workspaceName,
      toolName,
      currentUser?.id,
      resolveUUID,
      cachedPreviewSearchParam,
    ],
    [basePath, currentUser?.id, toolName, workspaceName, cachedPreviewSearchParam],
  )
}

function usePreviewUrlSecret(enabled: boolean, deps: (string | symbol | undefined)[]) {
  const client = useClient({apiVersion: API_VERSION})
  const currentUser = useCurrentUser()
  const [secretLastExpiredAt, setSecretLastExpiredAt] = useState<string>('')

  const previewUrlSecret = enabled
    ? suspend(async () => {
        return await createPreviewSecret(
          client,
          '@sanity/presentation',
          typeof window === 'undefined' ? '' : location.href,
          currentUser?.id,
        )
      }, [...deps, secretLastExpiredAt])
    : null

  useEffect(() => {
    if (!previewUrlSecret) return
    const timeout = setTimeout(() => {
      startTransition(() => setSecretLastExpiredAt(previewUrlSecret.expiresAt.toString()))
    }, previewUrlSecret.expiresAt.getTime() - Date.now())
    return () => clearTimeout(timeout)
  }, [previewUrlSecret])

  return previewUrlSecret?.secret || null
}
