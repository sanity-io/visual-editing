// Shared env details so everything is in one place

export const projectId = 'hiomol4a'
// https://www.sanity.io/organizations/oSyH1iET5/project/hiomol4a/datasets
export const datasets = {
  // @TODO unknown, demo data?
  production: 'production',
  // @TODO unknown, cody branch?
  'preview-poc': 'preview-poc',
  // Test data, used for e2e during development
  development: 'development',
  // Also test data, used with cross dataset references to ensure we fully support it
  'cross-dataset-references': 'cross-dataset-references',
} as const

function maybeGitBranchStudioUrl(url: string) {
  if (typeof document === 'undefined') return url
  const { hostname } = document.location

  if (hostname.endsWith('.sanity.build') && hostname.includes('-git-')) {
    return `https://visual-editing-studio-git-${hostname.split('-git-')[1]}`
  }
  return url
}
export const studioUrl = maybeGitBranchStudioUrl(
  process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3333'
    : 'https://visual-editing-studio.sanity.build',
)

export const apiVersion = '2023-10-11'

export const workspaces = {
  remix: {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'remix',
    tool: 'composer',
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
  nuxt: {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'nuxt',
    tool: 'composer',
  },
  svelte: {
    projectId: projectId,
    dataset: datasets.development,
    workspace: 'svelte',
    tool: 'composer',
  },
  'cross-dataset-references': {
    projectId: projectId,
    dataset: datasets['cross-dataset-references'],
    workspace: datasets['cross-dataset-references'],
    tool: 'desk',
  },
} as const
