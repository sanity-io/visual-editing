import { WrappedValue } from '@sanity/csm'
import { AppLayout } from './AppLayout'
import { SiteSettingsData } from './types'
import { Page, PageData } from '@/components/page'

export interface IndexPageData {
  page: PageData | null
  siteSettings: SiteSettingsData | null
}

export function IndexPage(props: { data: WrappedValue<IndexPageData> }) {
  const { data } = props

  return (
    <AppLayout data={{ siteSettings: data.siteSettings }}>
      {data.page && <Page data={data.page} />}
    </AppLayout>
  )
}
