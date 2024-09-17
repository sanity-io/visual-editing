import {apiVersion, workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {ClientConfig, createClient} from '@sanity/client'
import {useQuery} from '@sanity/react-loader'
import {GetStaticProps, InferGetStaticPropsType} from 'next'
import Link from 'next/link'

const {projectId, dataset} = workspaces['next-pages-router']

const sanityToken = process.env.SANITY_API_READ_TOKEN

function createSanityClient(config: ClientConfig) {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    stega: {
      studioUrl: (sourceDocument) => {
        if (
          sourceDocument._projectId === workspaces['cross-dataset-references'].projectId &&
          sourceDocument._dataset === workspaces['cross-dataset-references'].dataset
        ) {
          const {workspace, tool} = workspaces['cross-dataset-references']
          return {baseUrl, workspace, tool}
        }
        return {baseUrl, workspace: 'performance-test'}
      },
    },
    ...config,
  })
}
// Local development
const sanityClient = createSanityClient({
  useCdn: false,
  token: sanityToken,
  perspective: 'previewDrafts',
})
// Production
const cdnSanityClient = createSanityClient({
  useCdn: true,
  token: sanityToken,
  perspective: 'published',
})

export const getStaticProps = (async (context) => {
  const {draftMode = false} = context
  const {query, params} = getPageQuery('ISSUE-BUILDING')
  const client = draftMode ? sanityClient : cdnSanityClient

  const data = await client.fetch(query, params, {
    stega: draftMode ? true : false,
  })

  return {
    props: {data, query, params, draftMode},
  }
}) satisfies GetStaticProps

const Page = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const {query, params} = props
  const hook = useQuery<any>(query, params, {
    // @ts-expect-error
    initial: null,
  })
  const data = hook.data || props.data

  return (
    <div className="m-10">
      <Link href="/" className="mr-10 font-bold underline">
        Back to home
      </Link>

      <h2 className="text-lg font-bold">{data.name}</h2>

      {data.floors?.map((floor: any) => (
        <div className="m-2 border border-red-500 p-2" key={floor._id}>
          <h4 className="text-lg font-bold">{floor?.title}</h4>

          <div className="flex flex-wrap justify-around gap-4">
            {floor?.spaces?.map((space: any) => <SpaceCard space={space} key={space._id} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Page

interface SpaceCardProps {
  space: any
}

const SpaceCard: React.FC<SpaceCardProps> = ({space}) => {
  return (
    <div className="rounded-lg border-2 border-blue-500 p-2">
      <h4>{space.name}</h4>
      <p>Capacity: {space.capacity}</p>
      <p>{space.description}</p>
      <p>{space.spaceType[0].name}</p>
    </div>
  )
}

const getPageQuery = (path: string) => {
  return {
    query: /* groq */ `
      *[_type == "Building" && buildingId == $path][0]{
        ...,
        features[]->,
        floors[]->{
          ...,
          spaces[]->{
            _id,
            _type,
            title,
            capacity,
            isActive,
            isReservable,
            name,
            systemId,
            sourceSystemRecordCode,
            audioDevice,
            displayDevice,
            videoDevice,
            description,
            images,
            spaceCode,
            spaceType[]->{
              ...,
            }
          }
        }
      }
    `,
    params: {path},
  }
}
