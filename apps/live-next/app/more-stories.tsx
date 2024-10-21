import type {MoreStoriesQueryResult} from '@/sanity.types'
import {TransitionLayoutShift} from 'next-live-transitions'
import Link from 'next/link'
import Avatar from './avatar'
import CoverImage from './cover-image'
import DateComponent from './date'

// export default async function MoreStories(params: {skip: string; limit: number}) {
export default async function MoreStories({data}: {data: MoreStoriesQueryResult}) {
  // const {data} = await sanityFetch({query: moreStoriesQuery, params})

  // return (
  //   <SanityLiveStream query={moreStoriesQuery} params={params}>
  //     {async ({data}: {data: MoreStoriesQueryResult}) => {
  //       'use server'

  return (
    <div className="mb-32 grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-16 md:gap-y-32 lg:gap-x-32">
      <TransitionLayoutShift>
        {data?.map((post) => {
          const {_id, title, slug, coverImage, excerpt, author} = post
          return (
            <article key={_id} style={{viewTransitionName: `post-${_id}`}}>
              <Link
                href={`/posts/${slug}`}
                className="group mb-5 block"
                style={{viewTransitionName: `post-${_id}-cover-image`}}
              >
                <CoverImage image={coverImage} priority={false} />
              </Link>
              <h3
                className="mb-3 text-balance text-3xl leading-snug"
                style={{viewTransitionName: `post-${_id}-heading`}}
              >
                <Link href={`/posts/${slug}`} className="hover:underline">
                  {title}
                </Link>
              </h3>
              <div className="mb-4 text-lg" style={{viewTransitionName: `post-${_id}-date`}}>
                <DateComponent dateString={post.date} />
              </div>
              <div style={{viewTransitionName: `post-${_id}-excerpt`}}>
                {excerpt && <p className="mb-4 text-pretty text-lg leading-relaxed">{excerpt}</p>}
              </div>
              <div style={{viewTransitionName: `post-${_id}-author`}}>
                {author && <Avatar name={author.name} picture={author.picture} />}
              </div>
            </article>
          )
        })}
      </TransitionLayoutShift>
    </div>
  )
  //     }}
  //   </SanityLiveStream>
  // )
}
