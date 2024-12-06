export function getLinkHref(href: string, referer: string): string {
  try {
    const parsed = new URL(href, typeof location === 'undefined' ? undefined : location.origin)
    if (parsed.hash) {
      const hash = new URL(getLinkHref(parsed.hash.slice(1), referer))
      return `${parsed.origin}${parsed.pathname}${parsed.search}#${hash.pathname}${hash.search}`
    }
    parsed.searchParams.set('preview', referer)
    return parsed.toString()
  } catch {
    return href
  }
}
