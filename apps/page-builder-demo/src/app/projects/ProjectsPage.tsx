import { WrappedValue } from '@sanity/csm'
import { sanity } from '@sanity/react-loader/jsx'

import { AppLayout } from '../AppLayout'
import { SiteSettingsData } from '../types'
import Link from 'next/link'

export interface ProjectsPageData {
  projects: {
    _id: string
    title: string | null
    slug: {
      current: string
    }
  }[]
  siteSettings: SiteSettingsData | null
}

export function ProjectsPage(props: { data: WrappedValue<ProjectsPageData> }) {
  const { data } = props

  return (
    <AppLayout data={{ siteSettings: data.siteSettings }}>
      <main className="mx-auto max-w-4xl">
        <div className="p-5">
          <h1 className="text-2xl font-extrabold">Projects</h1>
        </div>

        <div>
          {data.projects?.length > 0 && (
            <div className="flex flex-col gap-2">
              {data.projects.map((project) => (
                <Link
                  className="block p-5 hover:bg-gray-50 dark:hover:bg-gray-950"
                  href={`/project/${project.slug.current.value}`}
                  key={project._id}
                >
                  <div className="text-md">
                    {project.title ? (
                      <sanity.span>{project.title}</sanity.span>
                    ) : (
                      <em>Untitled</em>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
