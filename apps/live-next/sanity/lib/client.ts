import {apiVersion, dataset, projectId} from '@/sanity/lib/api'
import {workspaces} from '@repo/env'
import {studioUrl as baseUrl} from '@repo/studio-url'
import {createClient} from 'next-sanity'
import {token} from './token'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  token,
  stega: {
    studioUrl: (sourceDocument) => {
      if (
        sourceDocument._projectId === workspaces['cross-dataset-references'].projectId &&
        sourceDocument._dataset === workspaces['cross-dataset-references'].dataset
      ) {
        const {workspace, tool} = workspaces['cross-dataset-references']
        return {baseUrl, workspace, tool}
      }
      const {workspace, tool} = workspaces['live-demo']
      return {baseUrl, workspace, tool}
    },
    filter: (props) => {
      if (props.sourcePath.at(-1) === 'title') {
        return true
      }

      return props.filterDefault(props)
    },
  },
})
