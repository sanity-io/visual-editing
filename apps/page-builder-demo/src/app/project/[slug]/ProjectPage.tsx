import {WrappedValue} from '@sanity/react-loader/jsx'
import {sanity} from '@sanity/react-loader/jsx'

import {AppLayout} from '@/app/AppLayout'
import {SiteSettingsData} from '@/app/types'

export interface ProjectData {
  _id: string
  title?: string
  media?: {_type: 'image'; asset: {}}[]
}

export interface ProjectPageData {
  project: ProjectData | null
  siteSettings: SiteSettingsData | null
}

export function ProjectPage(props: {data: WrappedValue<ProjectPageData>}) {
  const {data} = props

  return (
    <AppLayout data={{siteSettings: data.siteSettings}}>
      <main className="mx-auto max-w-4xl p-5">
        <h1 className="text-2xl font-extrabold">
          <sanity.span>{data?.project?.title}</sanity.span>
        </h1>
      </main>
    </AppLayout>
  )
}
