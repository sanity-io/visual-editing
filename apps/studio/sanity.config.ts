import {apiVersion, workspaces} from '@repo/env'
import {
  crossDatasetReferencesPlugin,
  liveDemoPlugin,
  pageBuilderDemoPlugin,
  performanceTestPlugin,
  shoesPlugin,
} from '@repo/sanity-schema'
import {debugSecrets} from '@sanity/preview-url-secret/sanity-plugin-debug-secrets'
import {vercelProtectionBypassTool} from '@sanity/vercel-protection-bypass'
import {visionTool} from '@sanity/vision'
import {DECISION_PARAMETERS_SCHEMA, defineConfig, definePlugin, type PluginOptions} from 'sanity'
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type PreviewUrlOption,
  type PreviewUrlResolverOptions,
} from 'sanity/presentation'
import {CustomHeader} from './presentation/CustomHeader'
import {CustomNavigator} from './presentation/CustomNavigator'
import {StegaDebugger} from './presentation/DebugStega'

const debugPlugin = definePlugin({
  name: '@repo/vision',
  plugins: [
    visionTool({defaultApiVersion: apiVersion}),
    debugSecrets(),
    vercelProtectionBypassTool(),
  ],
  form:
    process.env.SANITY_STUDIO_STEGA_DEBUG === 'true' ? {components: {input: StegaDebugger}} : {},
})

function resolvePreviewUrl(
  envUrl: string | undefined,
  resolveBranchUrl: (endsWith: string) => string,
  fallback: string,
) {
  if (envUrl) return envUrl
  if (process.env.SANITY_STUDIO_VERCEL_ENV === 'preview') {
    const branchUrl = process.env.SANITY_STUDIO_VERCEL_BRANCH_URL
    if (branchUrl) {
      const [, endsWith] = branchUrl.split('-git-')
      if (endsWith) return resolveBranchUrl(endsWith)
    }
  }
  return fallback
}
const urls = {
  'astro': resolvePreviewUrl(
    process.env.SANITY_STUDIO_ASTRO_PREVIEW_URL,
    (endsWith) => `https://visual-editing-astro-git-${endsWith}/shoes`,
    'http://localhost:3006/shoes',
  ),
  'live-next': resolvePreviewUrl(
    process.env.SANITY_STUDIO_LIVE_NEXT_PREVIEW_URL,
    (endsWith) => `https://live-visual-editing-next-git-${endsWith}`,
    'http://localhost:3009',
  ),
  'next-app-router': resolvePreviewUrl(
    process.env.SANITY_STUDIO_NEXT_APP_ROUTER_PREVIEW_URL,
    (endsWith) => `https://visual-editing-next-git-${endsWith}/shoes`,
    'http://localhost:3001/shoes',
  ),
  'next-pages-router': resolvePreviewUrl(
    process.env.SANITY_STUDIO_NEXT_PAGES_ROUTER_PREVIEW_URL,
    (endsWith) => `https://visual-editing-next-git-${endsWith}/pages-router/shoes`,
    'http://localhost:3001/pages-router/shoes',
  ),
  'nuxt': resolvePreviewUrl(
    process.env.SANITY_STUDIO_NUXT_PREVIEW_URL,
    (endsWith) => `https://visual-editing-nuxt-git-${endsWith}/shoes`,
    'http://localhost:3003/shoes',
  ),
  'page-builder-demo': resolvePreviewUrl(
    process.env.SANITY_STUDIO_PAGE_BUILDER_DEMO_PREVIEW_URL,
    (endsWith) => `https://visual-editing-page-builder-demo-git-${endsWith}`,
    'http://localhost:3005',
  ),
  'remix': resolvePreviewUrl(
    process.env.SANITY_STUDIO_REMIX_PREVIEW_URL,
    (endsWith) => `https://visual-editing-remix-git-${endsWith}/shoes`,
    'http://localhost:3000/shoes',
  ),
  'svelte': resolvePreviewUrl(
    process.env.SANITY_STUDIO_SVELTE_PREVIEW_URL,
    (endsWith) => `https://visual-editing-svelte-git-${endsWith}`,
    'http://localhost:3004',
  ),
}

// Some apps have a Preview Mode, some don't
function definePreviewUrl(
  previewUrl: string,
  workspaceName: string,
  toolName: string,
): PreviewUrlOption {
  if (
    workspaceName === 'live-demo' ||
    workspaceName === 'page-builder-demo' ||
    workspaceName === 'next'
  ) {
    const {origin, pathname} = new URL(previewUrl)
    const previewMode = {
      enable: '/api/draft-mode/enable',
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
  if (workspaceName === 'remix') {
    const {origin, pathname} = new URL(previewUrl)
    const previewMode = {
      enable: '/api/preview-mode/enable',
      disable: '/api/preview-mode/disable',
    } satisfies PreviewUrlResolverOptions['previewMode']
    return {origin, preview: pathname, previewMode}
  }

  return previewUrl
}

function defineWorkspace(
  config: {projectId: string; dataset: string; workspace: string; tool: string},
  plugins: PluginOptions[],
) {
  const {projectId, dataset, workspace} = config

  return defineConfig({
    name: workspace,
    basePath: `/${workspace}`,
    projectId,
    dataset,
    plugins,
    [DECISION_PARAMETERS_SCHEMA]: () => ({
      audiences: {title: 'Audiences', type: 'string', options: ['aud-a', 'aud-b', 'aud-c']},
      locales: {title: 'Locales', type: 'string', options: ['en-GB', 'en-US']},
      age: {title: 'Age', type: 'number'},
      gender: {title: 'Gender', type: 'string', options: ['male', 'female']},
    }),
    releases: {enabled: true},
  })
}

export default defineConfig([
  defineWorkspace(workspaces['page-builder-demo'], [
    pageBuilderDemoPlugin({
      previewUrl: definePreviewUrl(
        urls['page-builder-demo'],
        workspaces['page-builder-demo'].workspace,
        workspaces['page-builder-demo'].tool,
      ),
      components: {
        unstable_header: {
          component: CustomHeader,
        },
        unstable_navigator: {
          minWidth: 120,
          maxWidth: 240,
          component: CustomNavigator,
        },
      },
    }),
    debugPlugin(),
  ]),
  defineWorkspace(workspaces['live-demo'], [
    liveDemoPlugin({
      previewUrl: definePreviewUrl(
        urls['live-next'],
        workspaces['live-demo'].workspace,
        workspaces['live-demo'].tool,
      ),
    }),
    debugPlugin(),
  ]),
  defineWorkspace(workspaces['remix'], [
    shoesPlugin({
      previewUrl: definePreviewUrl(
        urls['remix'],
        workspaces['remix'].workspace,
        workspaces['remix'].tool,
      ),
    }),
    debugPlugin(),
  ]),
  defineWorkspace(workspaces['next-app-router'], [
    shoesPlugin({
      name: workspaces['next-app-router'].tool,
      previewUrl: definePreviewUrl(
        urls['next-app-router'],
        workspaces['next-app-router'].workspace,
        workspaces['next-app-router'].tool,
      ),
    }),
    presentationTool({
      name: workspaces['next-pages-router'].tool,
      previewUrl: definePreviewUrl(
        urls['next-pages-router'],
        workspaces['next-pages-router'].workspace,
        workspaces['next-pages-router'].tool,
      ),
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: '/pages-router/shoes/:slug',
            filter: `_type == "shoe" && slug.current == $slug`,
          },
        ]),
        locations: {
          shoe: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: `/pages-router/shoes/${doc?.slug}`,
                },
                {
                  title: 'Shoes',
                  href: '/pages-router/shoes',
                },
              ],
            }),
          }),
        },
      },
    }),
    debugPlugin(),
  ]),
  defineWorkspace(workspaces['nuxt'], [
    shoesPlugin({
      previewUrl: definePreviewUrl(
        urls['nuxt'],
        workspaces['nuxt'].workspace,
        workspaces['nuxt'].tool,
      ),
    }),
    debugPlugin(),
  ]),
  defineWorkspace(workspaces['svelte-basic'], [
    shoesPlugin({
      name: workspaces['svelte-basic'].tool,
      previewUrl: definePreviewUrl(
        new URL('/shoes', urls.svelte).toString(),
        workspaces['svelte-basic'].workspace,
        workspaces['svelte-basic'].tool,
      ),
    }),
    presentationTool({
      name: workspaces['svelte-live-loader'].tool,
      previewUrl: definePreviewUrl(
        new URL('/shoes-live-loader', urls.svelte).toString(),
        workspaces['svelte-live-loader'].workspace,
        workspaces['svelte-live-loader'].tool,
      ),
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: '/shoes-live-loader/shoes/:slug',
            filter: `_type == "shoe" && slug.current == $slug`,
          },
        ]),
        locations: {
          shoe: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: `/shoes-live-loader/shoes/${doc?.slug}`,
                },
                {
                  title: 'Shoes',
                  href: '/shoes-live-loader/shoes',
                },
              ],
            }),
          }),
        },
      },
    }),
    presentationTool({
      name: workspaces['svelte-query-loader'].tool,
      previewUrl: definePreviewUrl(
        new URL('/shoes-query-loader', urls.svelte).toString(),
        workspaces['svelte-query-loader'].workspace,
        workspaces['svelte-query-loader'].tool,
      ),
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: '/shoes-query-loader/shoes/:slug',
            filter: `_type == "shoe" && slug.current == $slug`,
          },
        ]),
        locations: {
          shoe: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: `/shoes-query-loader/shoes/${doc?.slug}`,
                },
                {
                  title: 'Shoes',
                  href: '/shoes-query-loader/shoes',
                },
              ],
            }),
          }),
        },
      },
    }),
    debugPlugin(),
  ]),
  defineWorkspace(workspaces['astro'], [
    shoesPlugin({
      previewUrl: urls.astro,
    }),
    debugPlugin(),
  ]),
  defineWorkspace(workspaces['cross-dataset-references'], [
    crossDatasetReferencesPlugin(),
    debugPlugin(),
  ]),
  defineWorkspace({...workspaces['next-pages-router'], workspace: 'performance-test'}, [
    performanceTestPlugin(),
    presentationTool({
      previewUrl: {
        ...(definePreviewUrl(
          urls['next-pages-router'],
          'next',
          'pages-router',
        ) as PreviewUrlResolverOptions),
        preview: '/pages-router/performance-test',
      },
    }),
    debugPlugin(),
  ]),
])
