import {defineQuery} from 'next-sanity'
import Link from 'next/link'

import {sanityFetch} from '@/sanity/live'

const projectsPageQuery = defineQuery(`*[_type == "project" && defined(slug.current)]`)

export default async function ProjectsPage() {
  // @TODO fix typegen vs manual types issues
  const {data} = (await sanityFetch({query: projectsPageQuery})) as unknown as {
    data: {
      _id: string
      title: string | null
      slug: {
        current: string
      }
    }[]
  }

  return (
    <main className="mx-auto max-w-4xl">
      <div className="p-5">
        <h1 className="text-2xl font-extrabold">Projects</h1>
      </div>

      <div>
        {data?.length > 0 && (
          <div className="flex flex-col gap-2">
            {data.map((project) => (
              <Link
                className="block p-5 hover:bg-gray-50 dark:hover:bg-gray-950"
                href={`/project/${project.slug.current}`}
                key={project._id}
              >
                <div className="text-md">{project.title ? project.title : <em>Untitled</em>}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
