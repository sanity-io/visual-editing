import {projectPageQuery, projectSlugsQuery} from '@repo/page-builder-shared'

import {sanityFetch} from '@/sanity/live'

export interface ProjectData {
  _id: string
  title?: string
  media?: {_type: 'image'; asset: {}}[]
}

export interface ProjectPageData {
  project: ProjectData | null
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: projectSlugsQuery,
    stega: false,
    perspective: 'published',
  })
  return data
}

export default async function ProjectPage({params}: {params: Promise<{slug: string}>}) {
  // @TODO fix typegen vs manual types issues
  const {data} = (await sanityFetch({
    query: projectPageQuery,
    params,
  })) as unknown as {
    data: ProjectData | null
  }

  return (
    <main className="mx-auto max-w-4xl p-5">
      <h1 className="text-2xl font-extrabold">{data?.title}</h1>
    </main>
  )
}
