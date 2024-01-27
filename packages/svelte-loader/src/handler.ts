import { ClientPerspective } from '@sanity/client'
import type { SanityStegaClient } from '@sanity/client/stega'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { error, type Handle, redirect } from '@sveltejs/kit'

import { LoadQuery } from './types'

export const handler = ({
  draftMode,
  loadQuery,
}: {
  draftMode?: {
    secret: string
    client: SanityStegaClient
    cookie?: string
    enable?: string
    disable?: string
  }
  loadQuery?: LoadQuery
}): Handle => {
  // @todo Verify URLs?

  const cookieName = draftMode?.cookie || '__sanity_draft'
  const enablePath = draftMode?.enable || '/draft/enable'
  const disablePath = draftMode?.disable || '/draft/disable'

  return async ({ event, resolve }) => {
    const { cookies, url } = event

    // Set some defaults for perspective and useCdn
    let perspective: ClientPerspective | undefined = undefined
    let useCdn: boolean | undefined = undefined

    // If draftMode is configured, check the cookie to see if it also enabled
    if (draftMode) {
      event.locals.draftMode =
        event.cookies.get(cookieName) === draftMode.secret
      // Set default perspective and useCdn based on draftMode status
      perspective = event.locals.draftMode ? 'previewDrafts' : 'published'
      useCdn = event.locals.draftMode ? false : true

      // If draft mode is configured, check if the request is to enable or disable it
      if (event.url.pathname === enablePath) {
        const { isValid, redirectTo = '/' } = await validatePreviewUrl(
          draftMode.client,
          url.toString(),
        )

        if (!isValid) {
          throw error(401, 'Invalid secret')
        }

        const devMode = process.env.NODE_ENV === 'development'
        cookies.set(cookieName, draftMode.secret, {
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
