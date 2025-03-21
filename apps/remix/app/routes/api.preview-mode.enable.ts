import {validatePreviewUrl} from '@sanity/preview-url-secret'
import type {LoaderFunctionArgs} from '@vercel/remix'
import {client, token} from '~/sanity'
import {commitSession, getSession} from '~/sessions'

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))

  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }

  const {
    isValid,
    redirectTo = '/',
    studioPreviewPerspective,
  } = await validatePreviewUrl(client.withConfig({token}), request.url)
  if (!isValid) {
    return new Response('Invalid secret', {status: 401})
  }

  session.set('preview', 'true')
  session.unset('perspective')

  if (studioPreviewPerspective) {
    session.set('perspective', studioPreviewPerspective)
  }

  const url = new URL(request.url)
  url.searchParams.delete('sanity-preview-secret')
  url.searchParams.delete('sanity-preview-pathname')

  return new Response(null, {
    status: 307,
    headers: {
      'Location': `${redirectTo}?${url.searchParams}`,
      'Set-Cookie': await commitSession(session),
    },
  })
}
