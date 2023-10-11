import { visionTool } from '@sanity/vision'
import { defineConfig, definePlugin, defineType, defineField } from 'sanity'
import { deskTool } from 'sanity/desk'
import { composerTool } from '@sanity/composer'
import { schema } from 'apps-common'
import { workspaces } from 'apps-common/env'

const sharedSettings = definePlugin({
  name: 'sharedSettings',
  plugins: [deskTool(), visionTool()],
  schema,
})

// If we're on a preview deployment we'll want the iframe URLs to point to the same preview deployment
function maybeGitBranchUrl(url: string) {
  // console.log('maybeGitBranchUrl', url)
  if (
    !url.includes('.sanity.build') ||
    process.env.SANITY_STUDIO_VERCEL_ENV !== 'preview' ||
    !process.env.SANITY_STUDIO_VERCEL_BRANCH_URL
  ) {
    return url
  }
  const branchUrl = process.env.SANITY_STUDIO_VERCEL_BRANCH_URL.replace(
    'visual-editing-studio-git-',
    '',
  )
  const previewUrl = url.replace('.sanity.build', `-git-${branchUrl}`)
  // console.log({ branchUrl, previewUrl })
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
} as const).map(([name, previewUrl]) => {
  const {
    projectId,
    dataset,
    tool: toolName,
    workspace: workspaceName,
  } = Object.values(workspaces).find(
    (workspace) => workspace.workspace === name,
  )!

  if (typeof previewUrl === 'string') {
    return defineConfig({
      name: workspaceName,
      basePath: `/${workspaceName}`,
      projectId,
      dataset,
      plugins: [
        composerTool({
          name: toolName,
          previewUrl: maybeGitBranchUrl(previewUrl),
        }),
        sharedSettings(),
      ],
    })
  }

  return defineConfig({
    name: workspaceName,
    basePath: `/${workspaceName}`,
    projectId,
    dataset,
    plugins: [
      ...Object.entries(previewUrl).map(([name, previewUrl]) => {
        const { tool: toolName } = Object.values(workspaces).find(
          (workspace) => workspace.tool === name,
        )!
        return composerTool({
          name: toolName,
          previewUrl: maybeGitBranchUrl(previewUrl),
        })
      }),
      sharedSettings(),
    ],
  })
})

export default [
  ...composerWorkspaces,
  defineConfig({
    name: workspaces['cross-dataset-references'].workspace,
    basePath: `/${workspaces['cross-dataset-references'].workspace}`,
    projectId: workspaces['cross-dataset-references'].projectId,
    dataset: workspaces['cross-dataset-references'].dataset,
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
              fields: [
                defineField({
                  name: 'alt',
                  type: 'string',
                  title: 'Alt text',
                }),
              ],
            }),
          ],
        }),
      ],
    },
  }),
]
