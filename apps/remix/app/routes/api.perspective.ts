import {validateApiPerspective} from '@sanity/client'
import {json, type ActionFunctionArgs} from '@vercel/remix'
import {commitSession, getSession} from '~/sessions'

export async function action({request}: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const formData = await request.formData()
  const perspective = formData.get('perspective')

  if (!perspective || typeof perspective !== 'string') {
    return json({error: 'Invalid perspective'}, {status: 400})
  }

  try {
    validateApiPerspective(perspective)
    session.set('perspective', perspective)

    return json(
      {success: true},
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    )
  } catch (error) {
    return json({error: 'Invalid perspective'}, {status: 400})
  }
}
