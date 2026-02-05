import {workspaces} from '@repo/env'
import {defineCliConfig} from 'sanity/cli'

const {projectId, dataset} = workspaces['page-builder-demo']

export default defineCliConfig({
  api: {projectId, dataset},
  typegen: {
    schema: './node_modules/@repo/sanity-extracted-schema/page-builder-demo.json',
    generates: './src/sanity.types.ts',
  },
})
