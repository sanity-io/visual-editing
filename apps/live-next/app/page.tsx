import type {HeroQueryResult} from '@/sanity.types'
import {sanityFetch} from '@/sanity/lib/live'
import {heroQuery, settingsQuery} from '@/sanity/lib/queries'
import Link from 'next/link'
import {Suspense} from 'react'
import Avatar from './avatar'
import CoverImage from './cover-image'
import DateComponent from './date'
import MoreStories from './more-stories'
import PortableText from './portable-text'

function Intro(props: {title: string | null | undefined; description: any}) {
  const {title, description} = props

  if (!title && !description?.length) {
    return null
  }

  return (
    <section className="mb-16 mt-16 flex flex-col items-center lg:mb-12 lg:flex-row lg:justify-between">
      {title && (
        <h1 className="text-balance text-6xl font-bold leading-tight tracking-tighter lg:pr-8 lg:text-8xl">
          {title}
        </h1>
      )}
      {description.length > 0 && (
        <h2 className="mt-5 text-pretty text-center text-lg lg:pl-8 lg:text-left">
          <PortableText className="prose-lg" value={description} />
        </h2>
      )}
    </section>
  )
}

function HeroPost({
  title,
  slug,
  excerpt,
  coverImage,
  date,
  author,
}: Pick<
  Exclude<HeroQueryResult, null>,
  'title' | 'coverImage' | 'date' | 'excerpt' | 'author' | 'slug'
>) {
  return (
    <article>
      <Link className="group mb-8 block md:mb-16" href={`/posts/${slug}`}>
        <CoverImage image={coverImage} priority />
      </Link>
      <div className="mb-20 md:mb-28 md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8">
        <div>
          <h3 className="mb-4 text-pretty text-4xl leading-tight lg:text-6xl">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 text-lg md:mb-0">
            <DateComponent dateString={date} />
          </div>
        </div>
        <div>
          {excerpt && <p className="mb-4 text-pretty text-lg leading-relaxed">{excerpt}</p>}
          {author && <Avatar name={author.name} picture={author.picture} />}
        </div>
      </div>
    </article>
  )
}

export default async function Page() {
  const [{data: settings}, {data: heroPost}] = await Promise.all([
    sanityFetch({
      query: settingsQuery,
    }),
    sanityFetch({query: heroQuery}),
  ])

  return (
    <div className="container mx-auto px-5">
      <Intro title={settings?.title} description={settings?.description} />
      {heroPost && (
        <HeroPost
          title={heroPost.title}
          slug={heroPost.slug}
          coverImage={heroPost.coverImage}
          excerpt={heroPost.excerpt}
          date={heroPost.date}
          author={heroPost.author}
        />
      )}
      {heroPost?._id && (
        <aside>
          <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
            More Stories
          </h2>
          <Suspense>
            <MoreStories skip={heroPost._id} limit={100} />
          </Suspense>
        </aside>
      )}
    </div>
  )
}
