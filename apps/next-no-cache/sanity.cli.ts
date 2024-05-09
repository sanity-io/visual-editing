/**
 * This configuration file lets you run `$ sanity [command]` in this folder
 * Go to https://www.sanity.io/docs/cli to learn more.
 **/
import {loadEnvConfig} from '@next/env'
import {defineCliConfig} from 'sanity/cli'
import {projectId, datasets} from 'apps-common/env'

const dev = process.env.NODE_ENV !== 'production'
loadEnvConfig(__dirname, dev, {info: () => null, error: console.error})

const dataset = datasets['blog']

export default defineCliConfig({
  api: {projectId, dataset},
  vite: (config) => {
    return {
      ...config,
      envPrefix: ['NEXT_', 'SANITY_STUDIO_', 'VITE_'],
    }
  },
})
