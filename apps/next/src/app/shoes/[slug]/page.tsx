export default async function ShoePage({
  params,
}: {
  params: { slug: string }
}) {
  return (
    <p>
      {process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'} slug:{params.slug}
    </p>
  )
}
