export function resolveHref(documentType?: string, slugOrId?: string): string | undefined {
  switch (documentType) {
    case 'post':
      return slugOrId ? `/${slugOrId}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}
