import {sanityFetch} from '@/sanity/live'
import {defineQuery} from 'next-sanity'

export interface ProjectData {
  _id: string
  title?: string
  media?: {_type: 'image'; asset: {}}[]
}

export interface ProjectPageData {
  project: ProjectData | null
}

const projectSlugsQuery = defineQuery(
  /* groq */ `*[_type == "project" && defined(slug.current)]{"slug": slug.current}`,
)
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: projectSlugsQuery,
    stega: false,
    perspective: 'published',
  })
  return data
}

const projectPageQuery = defineQuery(`*[_type == "project" && slug.current == $slug][0]`)

export default async function ProjectPage({params}: {params: {slug: string}}) {
  // @TODO fix typegen vs manual types issues
  const {data} = (await sanityFetch({query: projectPageQuery, params})) as unknown as {
    data: ProjectData | null
  }

  return (
    <main className="mx-auto max-w-4xl p-5">
      <h1 className="text-2xl font-extrabold">{data?.title}</h1>
    </main>
  )
}
