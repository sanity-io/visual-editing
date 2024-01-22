import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Balancer from 'react-wrap-balancer'

import { AuthorAvatar, AuthorAvatarFallback } from '../AuthorAvatar'
import CoverImage from '../CoverImage'
import MoreStories from '../MoreStories'
import PostBody from '../PostBody'
import PostDate from '../PostDate'
import { urlForImage } from '@/lib/image'
import { postFields } from '@/lib/queries'
import { loadQuery } from '@/lib/loadQuery'

type Props = {
  params: { slug: string }
}

const query = /* groq */ `*[_type == "post" && slug.current == $slug][0] {
  ${postFields}
}`

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const [post, authorName] = await Promise.all([
    loadQuery<any>({ query, params, tags: [`post:${params.slug}`] }),
    // @TODO necessary as there's problems with type inference when `author-{name,image}` is used
    loadQuery<string | null>({
      query: /* groq */ `*[_type == "post" && slug.current == $slug][0].author->name`,
      params,
      tags: [`post:${params.slug}`, 'author'],
    }),
  ])
  // optionally access and extend (rather than replace) parent metadata
  const parentTitle = (await parent).title?.absolute
  const previousImages = (await parent).openGraph?.images || []

  return {
    authors: authorName ? [{ name: authorName }] : [],
    title: `${parentTitle} | ${post?.title}`,
    openGraph: {
      images: post?.mainImage?.asset?._ref
        ? [
            urlForImage(post.mainImage).height(1000).width(2000).url(),
            ...previousImages,
          ]
        : previousImages,
    },
  } satisfies Metadata
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = params
  const data = await loadQuery<any>({
    query,
    params,
    tags: [`post:${params.slug}`],
  })

  if (!data) {
    return notFound()
  }

  const { _id, title = 'Untitled', author, mainImage, body } = data ?? {}
  return (
    <>
      <article data-tags={JSON.stringify([`post:${params.slug}`])}>
        <h1 className="mb-12 text-6xl font-bold leading-tight tracking-tighter md:text-7xl md:leading-none lg:text-8xl">
          <Balancer>{title}</Balancer>
        </h1>
        <div className="hidden md:mb-12 md:block">
          {author?._ref && (
            <Suspense fallback={<AuthorAvatarFallback />}>
              <AuthorAvatar id={author?._ref} />
            </Suspense>
          )}
        </div>
        <div className="mb-8 sm:mx-0 md:mb-16">
          <CoverImage title={title} image={mainImage} priority slug={slug} />
        </div>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 block md:hidden">
            {author?._ref && (
              <Suspense fallback={<AuthorAvatarFallback />}>
                <AuthorAvatar id={author?._ref} />
              </Suspense>
            )}
          </div>
          <div className="mb-6 text-lg">
            <PostDate dateString={data.publishedAt} />
          </div>
        </div>
        <PostBody body={body} />
      </article>
      <aside>
        <hr className="border-accent-2 mb-24 mt-28" />
        <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
          Recent Stories
        </h2>
        <Suspense>
          <MoreStories skip={_id} limit={2} />
        </Suspense>
      </aside>
    </>
  )
}
