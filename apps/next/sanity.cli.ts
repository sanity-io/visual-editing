import {workspaces} from '@repo/env'
import {defineCliConfig} from 'sanity/cli'

const {projectId, dataset} = workspaces['next-app-router']

export default defineCliConfig({
  api: {projectId, dataset},
  typegen: {
    schema: './node_modules/@repo/sanity-extracted-schema/shoes.json',
    generates: './src/types.ts',
  },
})
