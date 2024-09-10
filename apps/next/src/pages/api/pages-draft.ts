import {client} from '@/components/sanity.client'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import type {NextApiRequest, NextApiResponse} from 'next'

const clientWithToken = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | void>) {
  if (!req.url) {
    throw new Error('Missing url')
  }
  const {isValid, redirectTo = '/pages-router/shoes'} = await validatePreviewUrl(
    clientWithToken,
    req.url,
  )
  if (!isValid) {
    return res.status(401).send('Invalid secret')
  }
  // Enable Draft Mode by setting the cookies
  res.setDraftMode({enable: true})
  res.writeHead(307, {Location: redirectTo})
  res.end()
}
