import { visionTool } from '@sanity/vision'
import { defineConfig, definePlugin, defineType, defineField } from 'sanity'
import { deskTool } from 'sanity/desk'
import {
  presentationTool,
  type PresentationPluginOptions,
  type PreviewUrlResolverOptions,
  type PreviewUrlOption,
} from '@sanity/presentation'
import { schema } from 'apps-common'
import { workspaces } from 'apps-common/env'
import { assist } from '@sanity/assist'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { locate } from './locate'
import { StegaDebugger } from './presentation/DebugStega'
// import { CustomNavigator } from './presentation/CustomNavigator'
import { debugSecrets } from '@sanity/preview-url-secret/sanity-plugin-debug-secrets'

const sharedSettings = definePlugin({
  name: 'sharedSettings',
  plugins: [deskTool(), assist(), unsplashImageAsset(), debugSecrets()],
  schema,
})

const devMode = (() => {
  const vercelEnv = process.env.SANITY_STUDIO_VERCEL_ENV
  if (vercelEnv === 'development' || vercelEnv === 'preview') return true

  return typeof document === 'undefined'
    ? false
    : location.hostname === 'localhost'
}) satisfies PresentationPluginOptions['devMode']

// If we're on a preview deployment we'll want the iframe URLs to point to the same preview deployment
function maybeGitBranchUrl(url: string) {
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
  return previewUrl
}

// Some apps have a Draft Mode, some don't
function definePreviewUrl(
  _previewUrl: string,
  workspaceName: string,
  toolName: string,
): PreviewUrlOption {
  const previewUrl = maybeGitBranchUrl(_previewUrl)
  if (workspaceName === 'next' && toolName === 'pages-router') {
    const { origin, pathname } = new URL(previewUrl)
    const draftMode = {
      enable: '/api/pages-draft',
      check: '/api/pages-check-draft',
      disable: '/api/pages-disable-draft',
    } satisfies PreviewUrlResolverOptions['draftMode']
    return { origin, preview: pathname, draftMode }
  }
  if (workspaceName === 'next' && toolName === 'app-router') {
    const { origin, pathname } = new URL(previewUrl)
    const draftMode = {
      enable: '/api/draft',
      check: '/api/check-draft',
      disable: '/api/disable-draft',
    } satisfies PreviewUrlResolverOptions['draftMode']
    return { origin, preview: pathname, draftMode }
  }

  return previewUrl
}

const presentationWorkspaces = Object.entries({
  remix:
    process.env.SANITY_STUDIO_REMIX_PREVIEW_URL ||
    'http://localhost:3000/shoes',
  next: {
    'app-router':
      process.env.SANITY_STUDIO_NEXT_APP_ROUTER_PREVIEW_URL ||
      'http://localhost:3001/shoes',
    'pages-router':
      process.env.SANITY_STUDIO_NEXT_PAGES_ROUTER_PREVIEW_URL ||
      'http://localhost:3001/pages-router/shoes',
  },
  nuxt:
    process.env.SANITY_STUDIO_NUXT_PREVIEW_URL || 'http://localhost:3003/shoes',
  svelte:
    process.env.SANITY_STUDIO_SVELTE_PREVIEW_URL ||
    'http://localhost:3004/shoes',
  'page-builder-demo':
    process.env.SANITY_STUDIO_PAGE_BUILDER_DEMO_PREVIEW_URL ||
    'http://localhost:3005/',
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
        sharedSettings(),
        presentationTool({
          name: toolName,
          previewUrl: definePreviewUrl(previewUrl, workspaceName, toolName),
          locate,
          devMode,
          // components:
          //   name === 'page-builder-demo'
          //     ? {
          //         unstable_navigator: {
          //           minWidth: 120,
          //           maxWidth: 240,
          //           component: CustomNavigator,
          //         },
          //       }
          //     : {},
        }),
        visionTool(),
      ],
    })
  }

  return defineConfig({
    name: workspaceName,
    basePath: `/${workspaceName}`,
    projectId,
    dataset,
    form: process.env.SANITY_STUDIO_STEGA_DEBUG === 'true' ? { components: { input: StegaDebugger } } : {},
    plugins: [
      sharedSettings(),
      ...Object.entries(previewUrl).map(([name, previewUrl]) => {
        const { tool: toolName } = Object.values(workspaces).find(
          (workspace) => workspace.tool === name,
        )!
        return presentationTool({
          name: toolName,
          previewUrl: definePreviewUrl(previewUrl, workspaceName, toolName),
          // @TODO fix the locator for the pages-router
          locate: toolName === 'pages-router' ? undefined : locate,
          devMode,
        })
      }),
      visionTool(),
    ],
  })
})

export default [
  ...presentationWorkspaces,
  defineConfig({
    name: workspaces['cross-dataset-references'].workspace,
    basePath: `/${workspaces['cross-dataset-references'].workspace}`,
    projectId: workspaces['cross-dataset-references'].projectId,
    dataset: workspaces['cross-dataset-references'].dataset,
    plugins: [deskTool(), visionTool(), assist(), unsplashImageAsset()],
    document: {
      unstable_comments: {
        enabled: true,
      },
    },
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
                captionField: 'alt',
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
