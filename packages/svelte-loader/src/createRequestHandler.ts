import { ClientPerspective } from '@sanity/client'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { error, type Handle, redirect } from '@sveltejs/kit'
import crypto from 'crypto'

import {
  loadQuery as defaultLoadQuery,
  unstable__serverClient,
} from './createQueryStore'
import { HandleOptions } from './types'

/**
 * @beta
 */
export const createRequestHandler = ({
  preview,
  loadQuery,
}: HandleOptions = {}): Handle => {
  const cookieName = preview?.cookie || '__sanity_preview'
  const enablePath = preview?.endpoints?.enable || '/preview/enable'
  const disablePath = preview?.endpoints?.disable || '/preview/disable'
  const client = preview?.client || unstable__serverClient.instance
  const secret = preview?.secret || crypto.randomBytes(16).toString('hex')

  if (!client) throw new Error('No client configured for preview')

  return async ({ event, resolve }) => {
    const { cookies, url } = event

    // Set some defaults for perspective and useCdn
    let perspective: ClientPerspective | undefined = undefined
    let useCdn: boolean | undefined = undefined

    // Check the cookie to see if it preview is enabled
    event.locals.preview = event.cookies.get(cookieName) === secret
    // Set default perspective and useCdn based on preview status
    perspective = event.locals.preview ? 'previewDrafts' : 'published'
    useCdn = event.locals.preview ? false : true

    // Check if the request is to enable or disable previews
    if (event.url.pathname === enablePath) {
      const { isValid, redirectTo = '/' } = await validatePreviewUrl(
        client,
        url.toString(),
      )

      if (!isValid) {
        throw error(401, 'Invalid secret')
      }

      const devMode = process.env.NODE_ENV === 'development'
      cookies.set(cookieName, secret, {
        httpOnly: true,
        sameSite: devMode ? 'lax' : 'none',
        secure: !devMode,
        path: '/',
      })

      return redirect(307, redirectTo)
    }

    if (event.url.pathname === disablePath) {
      cookies.delete(cookieName, { path: '/' })
      return redirect(307, url.searchParams.get('redirect') || '/')
    }

    // Add loadQuery to event locals with the defaults set above
    const lq = loadQuery || defaultLoadQuery
    event.locals.loadQuery = (query, params, options) =>
      lq(query, params, { perspective, useCdn, ...options })

    return await resolve(event)
  }
}
