// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore has to be exact for string replacement to work
const envUrl = process.env.VERCEL_BRANCH_URL
const isStablePreviewBranch = envUrl?.includes('-git-preview')
const isStableCanaryBranch = envUrl?.includes('-git-canary')
const isLinearBranch = envUrl?.includes('-git-crx-')

/** @public */
export const studioUrl =
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore has to be exact for string replacement to work
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3333'
    : isLinearBranch && envUrl
      ? `https://visual-editing-studio-git-crx-${envUrl.split('-git-crx-')[1]}`
      : isStablePreviewBranch
        ? 'https://visual-editing-studio-git-preview.sanity.dev'
        : isStableCanaryBranch
          ? 'https://visual-editing-studio-git-canary.sanity.dev'
          : 'https://visual-editing-studio.sanity.dev'
