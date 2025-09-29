import {json, type ActionFunctionArgs} from '@vercel/remix'
import {commitSession, getSession} from '../sessions'

export async function action({request}: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const formData = await request.formData()
  const formDecideParameters = formData.get('decideParameters')

  if (!formDecideParameters || typeof formDecideParameters !== 'string') {
    return json({error: 'Invalid decideParameters'}, {status: 400})
  }

  try {
    session.set('decideParameters', formDecideParameters)

    return json(
      {success: true},
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    )
  } catch {
    return json({error: 'Invalid decideParameters JSON'}, {status: 400})
  }
}

export default function DecideParametersRoute() {
  return null
}