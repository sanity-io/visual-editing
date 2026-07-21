import {workspaces} from '@repo/env'
import imageUrlBuilder from '@sanity/image-url'

const {projectId, dataset} = workspaces['page-builder-vite']

export const urlBuilder = imageUrlBuilder({projectId, dataset})
