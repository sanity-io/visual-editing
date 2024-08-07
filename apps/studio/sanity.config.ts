import {visionTool} from '@sanity/vision'
import {defineConfig, definePlugin, defineType, defineField} from 'sanity'
import {structureTool} from 'sanity/structure'
import {
  presentationTool,
  type PreviewUrlResolverOptions,
  type PreviewUrlOption,
} from '@sanity/presentation'
import {schema} from 'apps-common'
import {workspaces} from 'apps-common/env'
import {assist} from '@sanity/assist'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {locate} from './locate'
import {StegaDebugger} from './presentation/DebugStega'
import {CustomNavigator} from './presentation/CustomNavigator'
import {debugSecrets} from '@sanity/preview-url-secret/sanity-plugin-debug-secrets'
import {documentLocationResolvers, mainDocumentResolvers} from './presentation/resolvers'
import Building from './models/documents/Building'
import Floor from './models/documents/Floor'
import Space from './models/documents/Space'
import SpaceType from './models/documents/SpaceType'

const sharedSettings = definePlugin({
  name: 'sharedSettings',
  plugins: [structureTool(), assist(), unsplashImageAsset(), debugSecrets()],
  schema: {
    ...schema,
    templates: [
      {
        id: 'page-basic',
        title: 'Basic page',
        schemaType: 'page',
        parameters: [{name: 'title', title: 'Page Title', type: 'string'}],
        value: (params: any) => {
          return {
            title: params.title,
            slug: {
              current: 'basic-slug',
            },
          }
        },
      },
    ],
  },
})

// Some apps have a Preview Mode, some don't
function definePreviewUrl(
  previewUrl: string,
  workspaceName: string,
  toolName: string,
): PreviewUrlOption {
  if (workspaceName === 'next' && toolName === 'pages-router') {
    const {origin, pathname} = new URL(previewUrl)
    const previewMode = {
      enable: '/api/pages-draft',
      check: '/api/pages-check-draft',
      disable: '/api/pages-disable-draft',
    } satisfies PreviewUrlResolverOptions['previewMode']
    return {origin, preview: pathname, previewMode}
  }
  if (workspaceName === 'next' && toolName === 'app-router') {
    const {origin, pathname} = new URL(previewUrl)
    const previewMode = {
      enable: '/api/draft',
      check: '/api/check-draft',
      disable: '/api/disable-draft',
    } satisfies PreviewUrlResolverOptions['previewMode']
    return {origin, preview: pathname, previewMode}
  }
  if (workspaceName === 'svelte' || workspaceName === 'nuxt') {
    const {origin, pathname} = new URL(previewUrl)
    const previewMode = {
      enable: '/preview/enable',
      disable: '/preview/disable',
    } satisfies PreviewUrlResolverOptions['previewMode']
    return {origin, preview: pathname, previewMode}
  }

  return previewUrl
}

const presentationWorkspaces = Object.entries({
  'remix': process.env.SANITY_STUDIO_REMIX_PREVIEW_URL || 'http://localhost:3000/shoes',
  'next': {
    'app-router':
      process.env.SANITY_STUDIO_NEXT_APP_ROUTER_PREVIEW_URL || 'http://localhost:3001/shoes',
    'pages-router':
      process.env.SANITY_STUDIO_NEXT_PAGES_ROUTER_PREVIEW_URL ||
      'http://localhost:3001/pages-router/shoes',
  },
  'nuxt': process.env.SANITY_STUDIO_NUXT_PREVIEW_URL || 'http://localhost:3003/shoes',
  'svelte': {
    'svelte-basic': new URL(
      process.env.SANITY_STUDIO_SVELTE_PREVIEW_URL || 'http://localhost:3004',
      '/shoes',
    ).toString(),
    'svelte-loaders': new URL(
      process.env.SANITY_STUDIO_SVELTE_PREVIEW_URL || 'http://localhost:3004',
      '/shoes-with-loaders',
    ).toString(),
  },
  'page-builder-demo':
    process.env.SANITY_STUDIO_PAGE_BUILDER_DEMO_PREVIEW_URL || 'http://localhost:3005/',
  'astro': process.env.SANITY_STUDIO_ASTRO_PREVIEW_URL || 'http://localhost:3006/shoes',
} as const).map(([name, previewUrl]) => {
  const {
    projectId,
    dataset,
    tool: toolName,
    workspace: workspaceName,
  } = Object.values(workspaces).find((workspace) => workspace.workspace === name)!

  if (typeof previewUrl === 'string') {
    return defineConfig({
      name: workspaceName,
      basePath: `/${workspaceName}`,
      projectId,
      dataset,
      plugins: [
        presentationTool({
          name: toolName,
          previewUrl: definePreviewUrl(previewUrl, workspaceName, toolName),
          resolve: {
            mainDocuments: mainDocumentResolvers,
            locations: documentLocationResolvers,
          },
          locate,
          components:
            name === 'page-builder-demo'
              ? {
                  unstable_navigator: {
                    minWidth: 120,
                    maxWidth: 240,
                    component: CustomNavigator,
                  },
                }
              : {},
        }),
        sharedSettings(),
        visionTool(),
      ],
    })
  }

  return defineConfig({
    name: workspaceName,
    basePath: `/${workspaceName}`,
    projectId,
    dataset,
    form:
      process.env.SANITY_STUDIO_STEGA_DEBUG === 'true' ? {components: {input: StegaDebugger}} : {},
    plugins: [
      ...Object.entries(previewUrl).map(([name, previewUrl]) => {
        const {tool: toolName} = Object.values(workspaces).find(
          (workspace) => workspace.tool === name,
        )!
        return presentationTool({
          name: toolName,
          previewUrl: definePreviewUrl(previewUrl, workspaceName, toolName),
          // @TODO fix the locator for the pages-router
          resolve:
            toolName === 'pages-router'
              ? undefined
              : {
                  mainDocuments: mainDocumentResolvers,
                  locations: documentLocationResolvers,
                },
          locate: toolName === 'pages-router' ? undefined : locate,
          unstable_showUnsafeShareUrl: toolName === 'app-router',
        })
      }),
      sharedSettings(),
      visionTool(),
    ],
  })
})

const crossDatasetReferencesWorkspace = defineConfig({
  name: workspaces['cross-dataset-references'].workspace,
  basePath: `/${workspaces['cross-dataset-references'].workspace}`,
  projectId: workspaces['cross-dataset-references'].projectId,
  dataset: workspaces['cross-dataset-references'].dataset,
  plugins: [structureTool(), visionTool(), assist(), unsplashImageAsset()],
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
            options: {source: 'name'},
          }),
          defineField({
            type: 'image',
            name: 'logo',
            title: 'Logo',
            options: {
              hotspot: true,
              // @ts-expect-error - find out how to get typings
              aiAssist: {
                imageDescriptionField: 'alt',
                imagePromptField: 'imagePromptField',
              },
            },
            fields: [
              defineField({
                name: 'alt',
                type: 'string',
                title: 'Alt text',
              }),
              defineField({
                type: 'text',
                name: 'imagePrompt',
                title: 'Image prompt',
                rows: 2,
              }),
            ],
          }),
        ],
      }),
      defineType({
        type: 'document',
        name: 'book',
        // @ts-expect-error - @TODO find out why TS is mad
        fields: [
          defineField({
            type: 'string',
            name: 'title',
            title: 'Title',
          }),
          defineField({
            type: 'reference',
            name: 'author',
            title: 'Author',
            to: [{type: 'author'}],
          }),
        ],
      }),
      defineType({
        type: 'document',
        name: 'author',
        // @ts-expect-error - @TODO find out why TS is mad
        fields: [
          defineField({
            type: 'string',
            name: 'name',
            title: 'Name',
          }),
        ],
      }),
    ],
  },
})

const performanceTestWorkspace = defineConfig({
  name: 'performance-test',
  basePath: `/performance-test`,
  projectId: workspaces['next-pages-router'].projectId,
  dataset: workspaces['next-pages-router'].dataset,
  plugins: [
    presentationTool({
      previewUrl: {
        ...(definePreviewUrl(
          process.env.SANITY_STUDIO_NEXT_PAGES_ROUTER_PREVIEW_URL ||
            'http://localhost:3001/pages-router/shoes',
          'next',
          'pages-router',
        ) as PreviewUrlResolverOptions),
        preview: '/pages-router/performance-test',
      },
    }),
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: [Building, Floor, Space, SpaceType],
  },
})

export default [
  ...presentationWorkspaces,
  crossDatasetReferencesWorkspace,
  performanceTestWorkspace,
]
