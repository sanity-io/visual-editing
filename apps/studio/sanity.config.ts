import {apiVersion, workspaces} from '@repo/env'
import {
  crossDatasetReferencesPlugin,
  liveDemoPlugin,
  pageBuilderDemoPlugin,
  performanceTestPlugin,
  shoesPlugin,
} from '@repo/sanity-schema'
import {debugSecrets} from '@sanity/debug-preview-url-secret-plugin'
import {vercelProtectionBypassTool} from '@sanity/vercel-protection-bypass'
import {visionTool} from '@sanity/vision'
import {defineConfig, definePlugin, type PluginOptions} from 'sanity'
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
  'page-builder-demo': resolvePreviewUrl(
    process.env.SANITY_STUDIO_PAGE_BUILDER_DEMO_PREVIEW_URL,
    (endsWith) => `https://visual-editing-page-builder-demo-git-${endsWith}`,
    'http://localhost:3005',
  ),
}

// Some apps have a Preview Mode, some don't
function definePreviewUrl(previewUrl: string, workspaceName: string): PreviewUrlOption {
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
    releases: {enabled: true},
  })
}

export default defineConfig([
  defineWorkspace(workspaces['page-builder-demo'], [
    pageBuilderDemoPlugin({
      previewUrl: definePreviewUrl(
        urls['page-builder-demo'],
        workspaces['page-builder-demo'].workspace,
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
      previewUrl: definePreviewUrl(urls['live-next'], workspaces['live-demo'].workspace),
    }),
    debugPlugin(),
  ]),
  defineWorkspace(workspaces['next-app-router'], [
    shoesPlugin({
      name: workspaces['next-app-router'].tool,
      previewUrl: definePreviewUrl(
        urls['next-app-router'],
        workspaces['next-app-router'].workspace,
      ),
    }),
    presentationTool({
      name: workspaces['next-pages-router'].tool,
      previewUrl: definePreviewUrl(
        urls['next-pages-router'],
        workspaces['next-pages-router'].workspace,
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
  defineWorkspace(workspaces['cross-dataset-references'], [
    crossDatasetReferencesPlugin(),
    debugPlugin(),
  ]),
  defineWorkspace({...workspaces['next-pages-router'], workspace: 'performance-test'}, [
    performanceTestPlugin(),
    presentationTool({
      previewUrl: {
        ...(definePreviewUrl(urls['next-pages-router'], 'next') as PreviewUrlResolverOptions),
        preview: '/pages-router/performance-test',
      },
    }),
    debugPlugin(),
  ]),
])
