import { Page } from '@/components/Page'
import { loadPage } from '@/data/sanity'

export default async function IndexRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const data = await loadPage('/', locale)

  return <Page data={data} />
}
