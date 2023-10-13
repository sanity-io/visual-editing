import { projectId } from 'apps-common/env'
import { VERCEL_ENV } from '$env/static/private'

/** @type {import('./$types').PageServerLoad} */
export function load() {
  return {
    vercelEnv: VERCEL_ENV || 'development',
    projectId,
  }
}
