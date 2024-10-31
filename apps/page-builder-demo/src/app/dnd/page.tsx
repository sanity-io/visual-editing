import {Page} from '@/components/dnd/Page'
import {sanityFetch} from '@/sanity/live'
import {createDataAttribute, defineQuery} from 'next-sanity'

interface PageData {
  _id: string
  title: string
  children: Array<any>
}

const dndPageQuery = defineQuery(`
  *[_type == "dndTestPage"]{
    _id,
    title,
    children
  }[0]
`)
export default async function DnDPage() {
  const {data} = (await sanityFetch({query: dndPageQuery})) as unknown as {
    data: {
      _id: string
      title: string
      children: Array<any>
    }
  }
  return <Page data={data as unknown as PageData} />
}
