import {SITE_SETTINGS_QUERY} from '@/app/queries'
// import {ProductPreview} from './ProductPreview'
import {loadQuery} from '@/sanity'
// import type {ProductPageData} from './ProductPage'

import {AppLayout} from '../AppLayout'
import {ExperimentPageData} from './ExperimentPage'
import {ExperimentPreview} from './ExperimentPreview'

const PAGE_QUERY = `//groq
{
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export default async function ExperimentPage(props: {params: {slug: string}}) {
  const {params} = props
  const initial = await loadQuery<ExperimentPageData>(PAGE_QUERY, {slug: params.slug})

  return <ExperimentPreview query={PAGE_QUERY} slug={params.slug} initial={initial} />
}
