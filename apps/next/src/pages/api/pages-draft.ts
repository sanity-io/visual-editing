import type { NextApiRequest, NextApiResponse } from 'next'

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse<string | void>,
) {
  /*
  if (!req.query.secret) {
    return res.status(401).send('Invalid secret')
  }

  const validSecret = await isValidSecret(
    getClient(),
    previewSecretId,
    Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret,
  )
  if (!validSecret) {
    return res.status(401).send('Invalid secret')
  }
  // */

  // Enable Draft Mode by setting the cookies
  res.setDraftMode({ enable: true })
  res.writeHead(307, { Location: '/pages-router/shoes' })
  res.end()
}
