import {urlForImage} from '@/lib/image'
import {loadQuery} from '@/lib/loadQuery'
import Image from 'next/image'
import Balancer from 'react-wrap-balancer'

const query = /* groq */ `*[_type == "author" && _id == $id][0]`

export async function AuthorAvatar(params: {id: string}) {
  const data = await loadQuery<any>({
    query,
    params,
  })
  const {name = 'Anonymous', image} = data ?? {}
  return (
    <>
      <div className="flex items-center">
        <div className="relative mr-4 h-12 w-12">
          <Image
            src={
              image?.asset?._ref
                ? urlForImage(image).height(96).width(96).fit('crop').url()
                : 'https://source.unsplash.com/96x96/?face'
            }
            className="rounded-full"
            height={96}
            width={96}
            alt={image?.alt || ''}
          />
        </div>
        <div className="text-xl font-bold">
          <Balancer>{name}</Balancer>
        </div>
      </div>
    </>
  )
}

export function AuthorAvatarFallback() {
  return (
    <div className="flex animate-pulse items-center">
      <div className="relative mr-4 h-12 w-12 rounded-full bg-gray-800/50 opacity-25" />
      <div className="text-xl font-bold opacity-30">Fetching author&hellip;</div>
    </div>
  )
}
