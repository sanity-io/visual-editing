import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  /*
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const documentType = searchParams.get('type')

  if (!token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required.',
    )
  }
  if (!secret) {
    return new Response('Invalid secret', { status: 401 })
  }


  const authenticatedClient = client.withConfig({ token })
  const validSecret = await isValidSecret(
    authenticatedClient,
    previewSecretId,
    secret,
  )
  if (!validSecret) {
    return new Response('Invalid secret', { status: 401 })
  }
  // */

  draftMode().enable()

  redirect('/')
}
