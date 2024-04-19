import {ProjectPreview} from './ProjectPreview'

export default function ProjectPage(props: {params: {slug: string}}) {
  const {params} = props

  return <ProjectPreview slug={params.slug} />
}
