export default function ProductsPage() {
  return <p>{process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'}</p>
}
