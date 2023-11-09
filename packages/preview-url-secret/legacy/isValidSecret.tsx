import { name } from '../package.json'

// updated within the hour, if it's older it'll create a new secret or return null
export const SECRET_TTL = 60 * 60

export const fetchSecretQuery = /* groq */ `*[_id == $id && dateTime(_updatedAt) > dateTime(now()) - ${SECRET_TTL}][0]{secret, _updatedAt}`
export type FetchSecretResponse = {
  secret: string | null
  _updatedAt: string | null
} | null

export const tag = name

export const apiVersion = '2023-08-08'

export type SanityClientLike = {
  config(): { token?: string }
  withConfig(config: {
    apiVersion?: string
    useCdn?: boolean
    perspective: 'raw'
    resultSourceMap: boolean
  }): SanityClientLike
  fetch<
    R,
    Q = {
      [key: string]: any
    },
  >(
    query: string,
    params: Q,
    options: { tag?: string },
  ): Promise<R>
}

const isDev = process.env.NODE_ENV === 'development'

export async function isValidSecret(
  client: SanityClientLike,
  urlSecretId: UrlSecretId,
  urlSecret: string,
): Promise<boolean> {
  if (!urlSecret) {
    throw new TypeError('`urlSecret` is required')
  }
  if (!urlSecretId) {
    throw new TypeError('`urlSecretId` is required')
  }
  if (!urlSecretId.includes('.')) {
    throw new TypeError(
      `\`urlSecretId\` must have a dot prefix, \`${urlSecretId}\` is not secure, add a prefix, for example \`preview.${urlSecretId}\` `,
    )
  }
  if (!client) {
    throw new TypeError('`client` is required')
  }
  if (!client.config().token) {
    throw new TypeError('`client` must have a `token` specified')
  }

  // If we're in the Edge Runtime it's usually too quick and we need to delay fetching the secret a little bit
  // eslint-disable-next-line no-warning-comments
  // @ts-expect-error -- @TODO add typings for EdgeRuntime
  if (typeof EdgeRuntime !== 'undefined') {
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  const customClient = client.withConfig({
    apiVersion,
    useCdn: false,
    perspective: 'raw',
    resultSourceMap: false,
  })
  const data = await customClient.fetch<FetchSecretResponse>(
    fetchSecretQuery,
    { id: urlSecretId },
    // @ts-expect-error -- the `cache` option is valid, but not in the types when NextJS typings aren't installed
    { cache: 'no-store', tag },
  )
  // eslint-disable-next-line no-process-env
  if (!data?.secret && isDev) {
    const exists = await client.fetch<null | Record<string, any>>(
      /* groq */ `*[_id == $id][0]`,
      { id: urlSecretId },
      // @ts-expect-error -- the `cache` option is valid, but not in the types when NextJS typings aren't installed
      { cache: 'no-store', tag },
    )
    if (!exists) {
      throw new TypeError(
        `Unable to find a secret in the dataset, with the id \`${urlSecretId}\`. Have you set the \`urlSecretId\` option in your \`Iframe\` and \`previewUrl\` configurations?`,
      )
    }
  }

  return data?.secret === urlSecret
}
