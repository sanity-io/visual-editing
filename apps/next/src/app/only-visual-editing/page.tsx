import {shoesList} from '@/queries'
import {draftMode} from 'next/headers'
import {client} from '../shoes/sanity.client'
import ShoesPageClient from './page.client'

const stegaClient = client.withConfig({
  stega: {enabled: true},
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'published',
  useCdn: false,
})

export default async function ShoesPage() {
  const {result, resultSourceMap} = await stegaClient.fetch(
    shoesList,
    {},
    {
      filterResponse: false,
      perspective: draftMode().isEnabled ? 'previewDrafts' : 'published',
      useCdn: draftMode().isEnabled ? false : true,
      next: {revalidate: false, tags: ['shoe']},
    },
  )
  return <ShoesPageClient data={result} sourceMap={resultSourceMap} />
}
