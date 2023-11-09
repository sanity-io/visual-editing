import type { NextApiRequest, NextApiResponse } from 'next'
import {
  validateUrlSecret,
  urlSearchParamPreviewSecret,
  urlSearchParamPreviewPathname,
} from '@sanity/preview-url-secret'
import { client } from '@/components/sanity'

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse<string | void>,
) {
  let secret = req.query[urlSearchParamPreviewSecret]
  if (Array.isArray(secret)) {
    secret = secret[0]
  }
  if (!secret) {
    return res.status(401).send('Missing secret')
  }
  const isValid = await validateUrlSecret(client, secret)
  if (!isValid) {
    return res.status(401).send('Invalid secret')
  }
  let unsafeRedirectTo = req.query[urlSearchParamPreviewPathname]
  if (Array.isArray(unsafeRedirectTo)) {
    unsafeRedirectTo = unsafeRedirectTo[0]
  }
  if (!unsafeRedirectTo || unsafeRedirectTo.includes('/api/')) {
    unsafeRedirectTo = '/pages-router/shoes'
  }
  const { pathname, search } = new URL(unsafeRedirectTo, 'https://example.com')
  const safeRedirectTo = `${pathname}${search}`

  // Enable Draft Mode by setting the cookies
  res.setDraftMode({ enable: true })
  res.writeHead(307, { Location: safeRedirectTo })
  res.end()
}
