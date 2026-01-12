import {createEditUrl, studioPathToJsonPath, type Path} from '@sanity/client/csm'
import {vercelStegaCombine} from '@vercel/stega'

function encodeEditUrl(path: Path, value: string) {
  const baseUrl = 'https://example.sanity.studio'
  const id = '123'
  const type = 'marketingPage'
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

export function MarketingPage(): React.JSX.Element {
  return (
    <>
      <div className="sticky left-0 top-0 z-10 bg-white p-4 dark:bg-black">
        <div className="m-auto max-w-6xl">
          <div className="text-2xl font-extrabold tracking-tight">
            <span className="text-purple-500">●</span> Marketing
          </div>
        </div>
      </div>

      <div className="min-h-[60vh] bg-purple-200 dark:bg-purple-800">
        <div className="m-auto h-full max-w-6xl px-4 py-6">
          <div className="flex h-full gap-6">
            <div className="prose flex-1 py-6 md:prose-lg lg:prose-xl dark:prose-invert prose-headings:font-extrabold prose-headings:tracking-tight prose-p:leading-snug">
              <h1 className="tracking-tight">
                {encodeEditUrl(
                  [{_key: 'a'}, 'title'],
                  'Modern card issuing that empowers innovators to change the world',
                )}
              </h1>

              <p className="mt-4 leading-snug">
                {encodeEditUrl(
                  [{_key: 'a'}, 'leading'],
                  'Instantly issue & process card payments with our open API platform.',
                )}
              </p>
            </div>

            <div className="flex-1 rounded-lg bg-black dark:bg-purple-700"></div>
          </div>
        </div>
      </div>

      <div className="min-h-[40vh] border-b border-gray-200 dark:border-gray-900">
        <div className="m-auto h-full max-w-6xl px-4 py-6">
          <div className="flex h-full gap-6">
            <div className="flex-1 rounded-lg bg-black dark:bg-white" />

            <div className="prose flex-1 py-6 md:prose-lg lg:prose-xl dark:prose-invert prose-headings:font-extrabold prose-headings:tracking-tight prose-p:leading-snug">
              <h2 className="leading-none">
                {encodeEditUrl(
                  [{_key: 'b'}, 'title'],
                  'Modern card issuing that empowers innovators to change the world',
                )}
              </h2>

              <p>
                {encodeEditUrl(
                  [{_key: 'b'}, 'leading'],
                  'Instantly issue & process card payments with our open API platform.',
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[40vh] border-b border-gray-200 dark:border-gray-900">
        <div className="m-auto h-full max-w-6xl px-4 py-6">
          <div className="flex h-full gap-6">
            <div className="prose flex-1 py-6 md:prose-lg lg:prose-xl dark:prose-invert prose-headings:font-extrabold prose-headings:tracking-tight prose-p:leading-snug">
              <h2 className="leading-none">
                {encodeEditUrl(
                  [{_key: 'c'}, 'title'],
                  'Modern card issuing that empowers innovators to change the world',
                )}
              </h2>

              <p className="mt-4 text-xl leading-snug">
                {encodeEditUrl(
                  [{_key: 'c'}, 'leading'],
                  'Instantly issue & process card payments with our open API platform.',
                )}
              </p>
            </div>

            <div className="flex-1 rounded-lg bg-black dark:bg-white" />
          </div>
        </div>
      </div>
    </>
  )
}
