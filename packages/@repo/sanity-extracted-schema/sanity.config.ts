import {workspaces} from '@repo/env'
import {
  crossDatasetReferencesPlugin,
  liveDemoPlugin,
  pageBuilderDemoPlugin,
  shoesPlugin,
} from '@repo/sanity-schema'
import {defineConfig} from 'sanity'

export default defineConfig([
  {
    ...workspaces['page-builder-demo'],
    name: workspaces['page-builder-demo'].workspace,
    basePath: `/${workspaces['page-builder-demo'].workspace}`,
    plugins: [
      // @ts-expect-error - TODO: Fix types
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
      // @ts-expect-error - TODO: Fix types
      shoesPlugin({
        previewUrl: '/',
      }),
    ],
  },
  {
    ...workspaces['cross-dataset-references'],
    name: workspaces['cross-dataset-references'].workspace,
    basePath: `/${workspaces['cross-dataset-references'].workspace}`,
    plugins: [
      // @ts-expect-error - TODO: Fix types
      crossDatasetReferencesPlugin(),
    ],
  },
  {
    ...workspaces['live-demo'],
    name: 'live-demo',
    basePath: `/live-demo`,
    plugins: [
      // @ts-expect-error - TODO: Fix types
      liveDemoPlugin({
        previewUrl: '/',
      }),
    ],
  },
])
