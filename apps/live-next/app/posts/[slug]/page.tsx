import {sanityFetch, SanityLiveStream} from '@/sanity/lib/live'
import {postQuery, settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata, ResolvingMetadata} from 'next'
import {defineQuery, type PortableTextBlock} from 'next-sanity'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'
import Avatar from '../../avatar'
import CoverImage from '../../cover-image'
import DateComponent from '../../date'
import MoreStories from '../../more-stories'
import PortableText from '../../portable-text'

const postSlugs = defineQuery(`*[_type == "post" && defined(slug.current)]{"slug": slug.current}`)

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: postSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(
  {params}: {params: Promise<{slug: string}>},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const {slug} = await params
  const {data: post} = await sanityFetch({query: postQuery, params: {slug}, stega: false})
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(post?.coverImage)

  return {
    authors: post?.author?.name ? [{name: post?.author?.name}] : [],
    title: post?.title,
    description: post?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function PostPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  // const [{data: post}, {data: settings}] = await Promise.all([
  //   sanityFetch({query: postQuery, params: {slug}}),
  //   sanityFetch({query: settingsQuery}),
  // ])
  const {data: post} = await sanityFetch({query: postQuery, params: {slug}})

  if (!post?._id) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-5">
      <SanityLiveStream query={settingsQuery}>
        {async ({data: settings}) => {
          'use server'
          return (
            <>
              {settings?.title && (
                <h2 className="mb-16 mt-10 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
                  <Link href="/" className="hover:underline">
                    {settings.title}
                  </Link>
                </h2>
              )}
            </>
          )
        }}
      </SanityLiveStream>
      <SanityLiveStream query={postQuery} params={{slug}}>
        {async ({data: post}) => {
          'use server'

          if (!post?._id) {
            return notFound()
          }

          return (
            <article>
              <h1 className="mb-12 text-balance text-6xl font-bold leading-tight tracking-tighter md:text-7xl md:leading-none lg:text-8xl">
                {post.title}
              </h1>
              <div className="hidden md:mb-12 md:block">
                {post.author && <Avatar name={post.author.name} picture={post.author.picture} />}
              </div>
              <div className="mb-8 sm:mx-0 md:mb-16">
                <CoverImage image={post.coverImage} priority />
              </div>
              <div className="mx-auto max-w-2xl">
                <div className="mb-6 block md:hidden">
                  {post.author && <Avatar name={post.author.name} picture={post.author.picture} />}
                </div>
                <div className="mb-6 text-lg">
                  <div className="mb-4 text-lg">
                    <DateComponent dateString={post.date} />
                  </div>
                </div>
              </div>
              {post.content?.length && post.content.length > 0 && (
                <PortableText
                  className="mx-auto max-w-2xl"
                  value={post.content as PortableTextBlock[]}
                />
              )}
            </article>
          )
        }}
      </SanityLiveStream>

      <aside>
        <hr className="border-accent-2 mb-24 mt-28" />
        <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
          Recent Stories
        </h2>
        <Suspense>
          <MoreStories skip={post._id} limit={2} />
        </Suspense>
      </aside>
    </div>
  )
}
