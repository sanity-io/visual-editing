import { formatCurrency } from 'apps-common/utils'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'

type Props = {
  params: { slug: string }
}

export const getServerSideProps = (async (context) => {
  const { params } = context
  const slug = Array.isArray(params!.slug) ? params!.slug[0] : params!.slug
  if (!slug) throw new Error('slug is required')
  return { props: { params: { slug } } }
}) satisfies GetServerSideProps<Props>

export default function ShoePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { params } = props
  return (
    <p>
      {process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'} slug:{params.slug}{' '}
      {formatCurrency(100)}
    </p>
  )
}
