// This config is only used by `sanity schema extract` (see the `extract` script in package.json).
// It intentionally only loads the schema plugins, without the debug plugins the Studio app adds,
// so the extracted schemas (and the types generated from them) stay free of debug document types.

import {workspaces} from '@repo/env'
import {defineConfig} from 'sanity'

import {liveDemoPlugin, pageBuilderDemoPlugin, shoesPlugin} from './src'

export default defineConfig([
  {
    ...workspaces['page-builder-demo'],
    name: workspaces['page-builder-demo'].workspace,
    basePath: `/${workspaces['page-builder-demo'].workspace}`,
    plugins: [
      pageBuilderDemoPlugin({
        previewUrl: '/',
      }),
    ],
  },
  {
    ...workspaces['next-app-router'],
    name: 'shoes',
    basePath: `/shoes`,
    plugins: [
      shoesPlugin({
        previewUrl: '/',
      }),
    ],
  },
  {
    ...workspaces['live-demo'],
    name: 'live-demo',
    basePath: `/live-demo`,
    plugins: [
      liveDemoPlugin({
        previewUrl: '/',
      }),
    ],
  },
])
