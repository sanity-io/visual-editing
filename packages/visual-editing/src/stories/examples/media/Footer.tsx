import {Link} from './Link'

export function Footer(): JSX.Element {
  return (
    <div className="p-4 md:p-5 lg:p-6">
      <div className="text-2xl font-extrabold leading-none tracking-tight sm:text-3xl md:text-4xl">
        <Link className="hover:text-blue-500" kind="Overlays" story="Media Home Page">
          ● Media
        </Link>
      </div>
    </div>
  )
}
