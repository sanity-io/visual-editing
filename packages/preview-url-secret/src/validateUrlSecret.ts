/** @internal */
export async function validateUrlSecret<SanityClientType>(
  client: SanityClientType,
  secret: string | null | undefined,
): Promise<boolean> {
  // eslint-disable-next-line no-console
  console.log('validateUrlSecret', { client, secret })

  return true
}
