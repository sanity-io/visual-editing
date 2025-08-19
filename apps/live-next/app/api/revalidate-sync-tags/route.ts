import type {NextRequest} from 'next/server'
import {revalidateTag} from 'next/cache'

export async function POST(request: NextRequest) {
  const tags = request.nextUrl.searchParams.getAll('tag')

  for (const tag of tags) {
    revalidateTag(`sanity:${tag}`)
  }
  return Response.json(tags)
}
