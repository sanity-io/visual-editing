import { ClientPerspective } from '@sanity/client'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { error, type Handle, redirect } from '@sveltejs/kit'

import { HandleOptions } from './types'

/**
 * @beta
 */
export const handler = ({ preview, loadQuery }: HandleOptions): Handle => {
  const cookieName = preview?.cookie || '__sanity_preview'
  const enablePath = preview?.endpoints?.enable || '/preview/enable'
  const disablePath = preview?.endpoints?.disable || '/preview/disable'

  return async ({ event, resolve }) => {
    const { cookies, url } = event

    // Set some defaults for perspective and useCdn
    let perspective: ClientPerspective | undefined = undefined
    let useCdn: boolean | undefined = undefined

    // If preview is configured, check the cookie to see if it also enabled
    if (preview) {
      event.locals.preview = event.cookies.get(cookieName) === preview.secret
      // Set default perspective and useCdn based on preview status
      perspective = event.locals.preview ? 'previewDrafts' : 'published'
      useCdn = event.locals.preview ? false : true

      // If preview is configured, check if the request is to enable or disable it
      if (event.url.pathname === enablePath) {
        const { isValid, redirectTo = '/' } = await validatePreviewUrl(
          preview.client,
          url.toString(),
        )

        if (!isValid) {
          throw error(401, 'Invalid secret')
        }

        const devMode = process.env.NODE_ENV === 'development'
        cookies.set(cookieName, preview.secret, {
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
    }

    if (loadQuery) {
      // If loadQuery is configured, add it to the event locals with the defaults set above
      event.locals.loadQuery = (query, params, options) =>
        loadQuery(query, params, { perspective, useCdn, ...options })
    }

    return await resolve(event)
  }
}
