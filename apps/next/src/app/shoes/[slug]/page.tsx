'use client'

import { formatCurrency } from 'apps-common/utils'

export default function ShoePage({ params }: { params: { slug: string } }) {
  return (
    <p>
      {process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'} slug:{params.slug}{' '}
      {formatCurrency(100)}
    </p>
  )
}
