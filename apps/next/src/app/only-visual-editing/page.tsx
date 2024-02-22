import { ShoesListResult, shoesList } from 'apps-common/queries'
import ShoesPageClient from './page.client'
import { client } from '../shoes/sanity.client'

const stegaClient = client.withConfig({
  stega: { enabled: true },
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'previewDrafts',
  useCdn: false,
})

export default async function ShoesPage() {
  const { result, resultSourceMap } = await stegaClient.fetch<ShoesListResult>(
    shoesList,
    {},
    { filterResponse: false, cache: 'no-store' },
  )
  return <ShoesPageClient data={result} sourceMap={resultSourceMap} />
}
