import CustomDnDBehaviour from '@/components/page/CustomDnDBehaviour'
import {dataAttribute} from '@/sanity/dataAttribute'
import {sanityFetch} from '@/sanity/live'
import {defineQuery, stegaClean} from 'next-sanity'

const dndPageQuery = defineQuery(`
  *[_type == "dndTestPage"]{
    _id,
    title,
    children
  }[0]
`)

export default async function Page() {
  const {data} = (await sanityFetch({query: dndPageQuery})) as unknown as {
    data: {
      _id: string
      title: string
      children: Array<any>
    }
  }

  return (
    <>
      <CustomDnDBehaviour />
      <div style={{padding: '2rem'}}>
        <h1>{data.title}</h1>
        <div className="flex flex-col flex-wrap gap-4 p-6">
          {data.children.map((child) => (
            <div
              data-sanity={dataAttribute({
                id: data._id,
                type: 'dndTestPage',
                path: `children[_key=="${child._key}"]`,
              }).toString()}
              className="border border-solid border-white p-6"
            >
              {stegaClean(child.title)}
              {child.children &&
                child.children.map((child1: any) => (
                  <div
                    data-sanity={dataAttribute({
                      id: data._id,
                      type: 'dndTestPage',
                      path: `children[_key=="${child._key}"].children[_key=="${child1._key}"]`,
                    }).toString()}
                    className="p-6"
                  >
                    {stegaClean(child1.title)}
                    {child1.children &&
                      child1.children.map((child2: any) => (
                        <div
                          data-sanity={dataAttribute({
                            id: data._id,
                            type: 'dndTestPage',
                            path: `children[_key=="${child._key}"].children[_key=="${child1._key}"].children[_key=="${child2._key}"]`,
                          }).toString()}
                          className="p-6"
                        >
                          {stegaClean(child2.title)}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
