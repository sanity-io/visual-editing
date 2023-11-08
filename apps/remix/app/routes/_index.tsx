import { Link } from '@remix-run/react'

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-10">
      <hr className="max-w-32 my-8 h-px w-full border-0 bg-slate-200 dark:bg-slate-700" />
      <Link to="/shoes">Shoes</Link>
    </div>
  )
}
