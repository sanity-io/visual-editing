import {ShoesListResult, shoesList} from 'apps-common/queries'
import ShoesPageClient from './page.client'
import {client} from '../shoes/sanity.client'
import {draftMode} from 'next/headers'

const stegaClient = client.withConfig({
  stega: {enabled: true},
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'previewDrafts',
  useCdn: false,
})

export default async function ShoesPage() {
  const {result, resultSourceMap} = await stegaClient.fetch<ShoesListResult>(
    shoesList,
    {},
    {
      filterResponse: false,
      perspective: draftMode().isEnabled ? 'previewDrafts' : 'published',
      useCdn: draftMode().isEnabled ? false : true,
      cache: 'no-store',
    },
  )
  return <ShoesPageClient data={result} sourceMap={resultSourceMap} />
}
