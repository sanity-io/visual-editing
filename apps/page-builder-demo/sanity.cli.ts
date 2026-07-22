import {workspaces} from '@repo/env'
import {defineCliConfig} from 'sanity/cli'

const {projectId, dataset} = workspaces['page-builder-demo']

export default defineCliConfig({
  api: {projectId, dataset},
  typegen: {
    schema: './schema.json',
    generates: './src/sanity.types.ts',
  },
})
