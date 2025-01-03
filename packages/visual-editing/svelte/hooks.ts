import crypto from 'crypto'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {redirect as defaultRedirect, error, type Handle} from '@sveltejs/kit'
import type {HandlePreviewOptions} from './types'

/**
 * @public
 */
export const handlePreview = ({client, preview}: HandlePreviewOptions): Handle => {
  const cookieName = preview?.cookie || '__sanity_preview'
  const enablePath = preview?.endpoints?.enable || '/preview/enable'
  const disablePath = preview?.endpoints?.disable || '/preview/disable'
  const secret = preview?.secret || crypto.randomBytes(16).toString('hex')
  const redirect = preview?.redirect || defaultRedirect

  if (!client) throw new Error('No client configured for preview')

  return async ({event, resolve}) => {
    const {cookies, url} = event

    // Check the cookie to see if it preview is enabled
    event.locals.preview = event.cookies.get(cookieName) === secret

    // Set default perspective and useCdn based on preview status
    const perspective = event.locals.preview ? 'previewDrafts' : 'published'
    const useCdn = event.locals.preview ? false : true

    // Check if the request is to enable or disable previews
    if (event.url.pathname === enablePath) {
      const {isValid, redirectTo = '/'} = await validatePreviewUrl(client, url.toString())

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
      cookies.delete(cookieName, {path: '/'})
      return redirect(307, url.searchParams.get('redirect') || '/')
    }

    // Add client to event locals with the defaults set above
    event.locals.client = client.withConfig({
      perspective,
      useCdn,
    })

    return await resolve(event)
  }
}
