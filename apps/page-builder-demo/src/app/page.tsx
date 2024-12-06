import {Page, sectionFragment} from '@/components/page'
import {sanityFetch} from '@/sanity/live'
import {defineQuery} from 'next-sanity'

const frontPageQuery = defineQuery(`
  *[_id == "siteSettings"][0]{
    frontPage->{
      _type,
      _id,
      title,
      ${sectionFragment},
      style
    }
  }.frontPage
`)

export default async function IndexPage() {
  const {data} = await sanityFetch({query: frontPageQuery})

  return <Page data={data} />
}
