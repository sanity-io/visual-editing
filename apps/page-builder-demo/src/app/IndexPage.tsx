import {Page, PageData} from '@/components/page'
import {WrappedValue} from '@sanity/react-loader/jsx'
import {AppLayout} from './AppLayout'
import {SiteSettingsData} from './types'

export interface IndexPageData {
  page: PageData | null
  siteSettings: SiteSettingsData | null
}

export function IndexPage(props: {data: WrappedValue<IndexPageData>}) {
  const {data} = props

  return (
    <AppLayout data={{siteSettings: data.siteSettings}}>
      {data.page && <Page data={data.page} />}
    </AppLayout>
  )
}
