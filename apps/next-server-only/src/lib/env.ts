export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-02'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
)

// This is always an empty string client side and is only used server side
export const token = process.env.SANITY_API_READ_TOKEN || ''

// Used to verify GROQ webhook revalidation requests, defining this will also disable time-based revalidation and only use on-demand revalidation
export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET || ''

// Used by `sanity-plugin-iframe-pane` to verify that draft mode was initiated by a valid Studio session
export const urlSecretId = `preview.secret`

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
