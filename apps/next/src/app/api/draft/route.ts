import {client} from '@/components/sanity.client'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {draftMode} from 'next/headers'
import {redirect} from 'next/navigation'

const clientWithToken = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
})

export async function GET(req: Request) {
  const {isValid, redirectTo = '/shoes'} = await validatePreviewUrl(clientWithToken, req.url)
  if (!isValid) {
    return new Response('Invalid secret', {status: 401})
  }

  draftMode().enable()

  redirect(redirectTo)
}
