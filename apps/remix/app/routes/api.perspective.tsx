import {validateApiPerspective} from '@sanity/client'
import {json, type ActionFunctionArgs} from '@vercel/remix'

import {commitSession, getSession} from '../sessions'

export async function action({request}: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const formData = await request.formData()
  const formPerspective = formData.get('perspective')

  if (!formPerspective || typeof formPerspective !== 'string') {
    return json({error: 'Invalid perspective'}, {status: 400})
  }
  const perspective = formPerspective.split(',')

  try {
    validateApiPerspective(perspective)
    session.set('perspective', Array.isArray(perspective) ? perspective.join(',') : perspective)

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

export default function PerspectiveRoute() {
  return null
}
