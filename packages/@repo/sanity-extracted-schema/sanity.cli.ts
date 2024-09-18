import {datasets, projectId} from '@repo/env'
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({api: {projectId, dataset: datasets.development}})
