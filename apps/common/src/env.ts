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

function maybeGitBranchStudioUrl(url: string) {
  if (typeof document === 'undefined') return url
  const {hostname} = document.location

  if (hostname.endsWith('.sanity.build') && hostname.includes('-git-')) {
    return `https://visual-editing-studio-git-${hostname.split('-git-')[1]}`
  }
  return url
}
let isStablePreviewBranch: boolean | undefined = false
try {
  isStablePreviewBranch =
    process.env['VERCEL_BRANCH_URL']?.includes('-git-preview') ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore has to be exact for string replacement to work
    process.env.NEXT_PUBLIC_VERCEL_URL?.includes('-git-preview')
} catch {
  //ignore
}

export const studioUrl = maybeGitBranchStudioUrl(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore has to be exact for string replacement to work
  process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3333'
    : isStablePreviewBranch
      ? 'https://visual-editing-studio-git-preview.sanity.build'
      : 'https://visual-editing-studio.sanity.build',
)

export const apiVersion = '2023-10-11'

export const workspaces = {
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
    tool: 'desk',
  },
  'page-builder-demo': {
    projectId: projectId,
    dataset: datasets['page-builder-demo'],
    workspace: 'page-builder-demo',
    tool: 'presentation',
  },
} as const
