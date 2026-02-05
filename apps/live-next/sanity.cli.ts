import {workspaces} from '@repo/env'
import {defineCliConfig} from 'sanity/cli'

const {projectId, dataset} = workspaces['live-demo']

export default defineCliConfig({
  api: {projectId, dataset},
  typegen: {
    schema: './node_modules/@repo/sanity-extracted-schema/live-demo.json',
  },
})
