function maybeGitBranchStudioUrl(url: string) {
  if (typeof document === 'undefined') return url
  const {hostname} = document.location

  if (hostname.endsWith('.sanity.dev') && hostname.includes('-git-')) {
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

// @TODO move this into its own package, so it can be built ahead of time so that we don't have to deal with the env vars on every app
export const studioUrl = maybeGitBranchStudioUrl(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore has to be exact for string replacement to work
  process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3333'
    : isStablePreviewBranch
      ? 'https://visual-editing-studio-git-preview.sanity.dev'
      : 'https://visual-editing-studio.sanity.dev',
)
