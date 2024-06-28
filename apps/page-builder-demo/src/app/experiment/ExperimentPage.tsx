import {WrappedValue} from '@sanity/react-loader/jsx'

import {AppLayout} from '@/app/AppLayout'
import {SiteSettingsData} from '@/app/types'
import {Experiment} from './Experiment'

export interface ExperimentPageData {
  siteSettings: SiteSettingsData | null
}

export function ExperimentPage(props: {data: WrappedValue<ExperimentPageData>}) {
  const {data} = props

  return (
    <AppLayout data={{siteSettings: data.siteSettings}}>
      <Experiment />
    </AppLayout>
  )
}
