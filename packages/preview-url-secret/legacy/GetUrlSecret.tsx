import { useEffect, useState } from 'react'
import { useClient } from 'sanity'

import {
  apiVersion,
  fetchSecretQuery,
  FetchSecretResponse,
  tag,
  UrlSecretId,
} from './isValidSecret'
import { SetError } from '../src/types'
import { getExpiresAt, patchUrlSecret } from './utils'

export interface GetUrlSecretProps {
  urlSecretId: UrlSecretId
  urlSecret: string | null
  setUrlSecret: (secret: string | null) => void
  setError: SetError
}
export function GetUrlSecret(props: GetUrlSecretProps) {
  const { urlSecretId, setUrlSecret, urlSecret, setError } = props
  const client = useClient({ apiVersion })
  const [secretExpiresAt, setSecretExpiresAt] = useState<null | Date>(null)

  if (!urlSecretId.includes('.')) {
    throw new TypeError(
      `\`urlSecretId\` must have a dot prefix, \`${urlSecretId}\` is not secure, add a prefix, for example \`preview.${urlSecretId}\` `,
    )
  }

  useEffect(() => {
    if (urlSecret) return

    async function getSecret(signal: AbortSignal): Promise<void> {
      const data = await client.fetch<FetchSecretResponse>(
        fetchSecretQuery,
        { id: urlSecretId },
        { signal, tag },
      )

      if (signal.aborted) return

      if (!data?.secret || !data?._updatedAt) {
        try {
          const newUpdatedAt = new Date()
          const newSecret = await patchUrlSecret(client, urlSecretId, signal)
          if (signal.aborted) return
          setUrlSecret(newSecret)
          setSecretExpiresAt(getExpiresAt(newUpdatedAt))
        } catch (err) {
          console.error(
            'Failed to create a new preview secret. Ensure the `client` has a `token` specified that has `write` permissions.',
            err,
          )
        }
        return
      }

      if (data?.secret !== urlSecret) {
        setUrlSecret(data?.secret)
        setSecretExpiresAt(getExpiresAt(new Date(data?._updatedAt)))
      }
    }

    const abort = new AbortController()
    getSecret(abort.signal).catch(
      (error) => error.name !== 'AbortError' && setError(error),
    )
    // eslint-disable-next-line consistent-return
    return () => abort.abort()
  }, [client, setError, setUrlSecret, urlSecret, urlSecretId])

  useEffect(() => {
    if (!secretExpiresAt) return

    const timeout = setTimeout(
      () => {
        setUrlSecret(null)
        setSecretExpiresAt(null)
      },
      Math.max(0, secretExpiresAt.getTime() - new Date().getTime()),
    )
    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timeout)
  }, [secretExpiresAt, setUrlSecret])

  return null
}
