// Shared env details so everything is in one place

export const projectId = 'hiomol4a'
// https://www.sanity.io/organizations/oSyH1iET5/project/hiomol4a/datasets
export const datasets = {
  // @TODO unknown, demo data?
  'production': 'production',
  // Test data, used for e2e during development
  'development': 'development',
  // Also test data, used with cross dataset references to ensure we fully support it
  'cross-dataset-references': 'cross-dataset-references',
  // demo dataset used for early prototyping
  'page-builder-demo': 'preview-poc',
  // Used for testing the Next.js official Sanity Blog starter
  'blog': 'blog',
} as const

export const apiVersion = '2025-02-19' as const

export const workspaces = {
  'astro': {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'astro',
    tool: 'presentation',
  },
  'remix': {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'remix',
    tool: 'presentation',
  },
  'next-app-router': {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'next',
    tool: 'app-router',
  },
  'next-pages-router': {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'next',
    tool: 'pages-router',
  },
  'nuxt': {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'nuxt',
    tool: 'presentation',
  },
  'svelte-basic': {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'svelte',
    tool: 'svelte-basic',
  },
  'svelte-loaders': {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'svelte',
    tool: 'svelte-loaders',
  },
  'cross-dataset-references': {
    projectId: projectId,
    dataset: datasets['cross-dataset-references'],
    workspace: datasets['cross-dataset-references'],
    tool: 'structure',
  },
  'page-builder-demo': {
    projectId: projectId,
    dataset: datasets['page-builder-demo'],
    workspace: 'page-builder-demo',
    tool: 'presentation',
  },
  'live-demo': {
    projectId: projectId,
    dataset: datasets.blog,
    workspace: 'live-demo',
    tool: 'presentation',
  },
} as const
