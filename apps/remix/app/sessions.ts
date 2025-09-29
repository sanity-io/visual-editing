import {ClientPerspective, validateApiPerspective} from '@sanity/client'
import {createCookieSessionStorage, type Session} from '@vercel/remix'

const {getSession, commitSession, destroySession} = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    secrets: [process.env.NODE_ENV, process.env.VERCEL_GIT_COMMIT_SHA as string],
  },
})

export {getSession, commitSession, destroySession}

export function getPerspective(session: Session): ClientPerspective {
  if (!session.has('perspective')) {
    return 'published'
  }
  const perspective = session.get('perspective').split(',')
  validateApiPerspective(perspective)
  return perspective
}

export function getDecideParameters(session: Session): string {
  if (!session.has('decideParameters')) {
    return ''
  }
  return session.get('decideParameters')
}
