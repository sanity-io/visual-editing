import { visionTool } from '@sanity/vision'
import { defineConfig, definePlugin, defineType, defineField } from 'sanity'
import { deskTool } from 'sanity/desk'
import { composerTool } from '@sanity/composer'
import { schema } from 'apps-common'
import { projectId, datasets } from 'apps-common/env'

const dataset = datasets.development

const sharedSettings = definePlugin({
  name: 'sharedSettings',
  plugins: [deskTool(), visionTool()],
  schema,
})

// If we're on a preview deployment we'll want the iframe URLs to point to the same preview deployment
function maybeGitBranchUrl(url: string) {
  console.log('maybeGitBranchUrl', url)
  if (
    !url.endsWith('sanity.build') ||
    process.env.SANITY_STUDIO_VERCEL_ENV !== 'preview' ||
    !process.env.SANITY_STUDIO_VERCEL_BRANCH_URL
  ) {
    console.warn('skip')
    return url
  }
  const branchUrl = process.env.SANITY_STUDIO_VERCEL_BRANCH_URL.replace(
    'visual-editing-studio-git-',
    '',
  )
  const previewUrl = url.replace('.sanity.build', `-git-${branchUrl}`)
  console.log({ branchUrl, previewUrl })
  return previewUrl
}

const composerWorkspaces = Object.entries({
  remix:
    process.env.SANITY_STUDIO_REMIX_PREVIEW_URL ||
    'http://localhost:3000/products',
  next: {
    'app-router':
      process.env.SANITY_STUDIO_NEXT_APP_ROUTER_PREVIEW_URL ||
      'http://localhost:3001/products',
    'pages-router':
      process.env.SANITY_STUDIO_NEXT_PAGES_ROUTER_PREVIEW_URL ||
      'http://localhost:3001/pages-router/products',
  },
  nuxt:
    process.env.SANITY_STUDIO_NUXT_PREVIEW_URL ||
    'http://localhost:3003/products',
  svelte:
    process.env.SANITY_STUDIO_SVELTE_PREVIEW_URL ||
    'http://localhost:3004/products',
}).map(([name, previewUrl]) => {
  const plugins =
    typeof previewUrl === 'string'
      ? [composerTool({ previewUrl: maybeGitBranchUrl(previewUrl) })]
      : Object.entries(previewUrl).map(([name, previewUrl]) =>
          composerTool({ name, previewUrl: maybeGitBranchUrl(previewUrl) }),
        )
  return defineConfig({
    name,
    basePath: `/${name}`,
    projectId,
    dataset,
    plugins: [...plugins, sharedSettings()],
  })
})

export default [
  ...composerWorkspaces,
  defineConfig({
    name: datasets['cross-dataset-references'],
    basePath: `/${datasets['cross-dataset-references']}`,
    projectId,
    dataset: datasets['cross-dataset-references'],
    plugins: [deskTool(), visionTool()],
    schema: {
      types: [
        defineType({
          type: 'document',
          name: 'brand',
          // @ts-expect-error - @TODO find out why TS is mad
          fields: [
            defineField({
              type: 'string',
              name: 'name',
              title: 'Name',
            }),
            defineField({
              type: 'slug',
              name: 'slug',
              title: 'Slug',
              options: { source: 'name' },
            }),
            defineField({
              type: 'image',
              name: 'logo',
              title: 'Logo',
              options: {
                hotspot: true,
              },
            }),
          ],
        }),
      ],
    },
  }),
]
