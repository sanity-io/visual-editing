export * from '../createQueryStore/server-only'

export const useEncodeDataAttribute = (): void => {
  throw new Error('The `useEncodeDataAttribute` hook can only be called from a client component.')
}
