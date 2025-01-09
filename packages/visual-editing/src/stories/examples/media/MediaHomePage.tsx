import {createEditUrl, studioPathToJsonPath, type Path} from '@sanity/client/csm'
import {vercelStegaCombine} from '@vercel/stega'
import {Footer} from './Footer'
import {Link} from './Link'
import {Navbar} from './Navbar'

function encodeEditUrl(id: string, path: Path, value: string) {
  const baseUrl = 'https://example.sanity.studio'
  const type = 'article'
  return vercelStegaCombine(
    value,
    {
      origin: 'sanity.io',
      href: createEditUrl({
        baseUrl,
        id,
        type,
        path: studioPathToJsonPath(path),
      }),
    },
    // We use custom logic to determine if we should skip encoding
    false,
  )
}

export function MediaHomePage(): React.JSX.Element {
  return (
    <>
      <div className="m-auto max-w-5xl">
        <Navbar />
      </div>

      <div className="max-w-5xl md:mx-3 lg:m-auto">
        <div className="divide-y divide-gray-200 rounded border-b border-t border-gray-200 md:border dark:divide-gray-900 dark:border-gray-900">
          <ArticlePreview
            id="a"
            mainImage="https://images.unsplash.com/photo-1636730987934-c6a10afd64d9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2148&q=80"
          />
          <ArticlePreview
            id="b"
            mainImage="https://images.unsplash.com/photo-1545599902-e86e23188f72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2728&q=80"
          />
          <ArticlePreview
            id="c"
            mainImage="https://images.unsplash.com/photo-1511131341194-24e2eeeebb09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2370&q=80"
          />
        </div>
      </div>

      <div className="m-auto max-w-5xl">
        <Footer />
      </div>
    </>
  )
}

function ArticlePreview(props: {mainImage: string; id: string}) {
  const {id, mainImage} = props

  return (
    <div>
      <Link className="md:flex" kind="Overlays" name="Media Article Page">
        <div className="flex-1 p-2 md:w-1/2">
          <img
            className="aspect-[4/2] md:aspect-[3/2]"
            src={mainImage}
            style={{objectFit: 'cover'}}
            alt={encodeEditUrl(id, ['mainImage', 'alt'], 'The power of newsletters')}
          />
        </div>

        <div className="flex flex-1 flex-col p-4 md:w-1/2">
          <h1 className="mb-2 text-4xl font-extrabold leading-none tracking-tight md:text-5xl">
            {encodeEditUrl(id, ['heading'], 'The power of newsletters')}
          </h1>

          <p className="mt-3 font-serif text-lg leading-snug">
            {encodeEditUrl(
              id,
              ['lead'],
              'The humble newsletter has been around for decades, but it has only recently emerged as a powerful media in its own right.',
            )}
          </p>

          <div className="mt-4 text-sm md:mt-auto">
            <span>{encodeEditUrl(id, ['publishedAt'], 'Oct 25, 2022')}</span>
            <span> ● </span>
            <span>
              {encodeEditUrl(id, ['publishedBy', {_key: 'carolina'}, 'name'], 'Carolina Gonzalez')}
            </span>
            <span> ● </span>
            <span>{encodeEditUrl(id, ['publishedBy', {_key: 'rune'}, 'name'], 'Rune Botten')}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
