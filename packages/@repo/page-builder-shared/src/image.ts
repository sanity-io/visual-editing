import {workspaces} from '@repo/env'
import {createImageUrlBuilder} from '@sanity/image-url'

// Both page-builder apps read from the same project and dataset
const {projectId, dataset} = workspaces['page-builder-demo']

export const imageUrlBuilder = createImageUrlBuilder({projectId, dataset})
