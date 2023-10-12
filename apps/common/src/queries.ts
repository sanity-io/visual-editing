import type { ImageCrop, ImageHotspot, PortableTextTextBlock } from 'sanity'

export const shoesList = /* groq */ `*[_type == "shoe"]{
  title,
  slug,
  price,
  "media": media[0]{alt, hotspot,crop,"url": asset->url},
  description,
  "brand": brandReference->{name, slug, logo{alt, hotspot,crop,"url": asset->url}},
}`
export type ShoesListResult = {
  title?: string | null
  slug?: { current?: string | null } | null
  price?: number | null
  media?: {
    alt?: string | null
    hotspot?: ImageHotspot | null
    crop?: ImageCrop | null
    url?: string | null
  } | null
  description?: PortableTextTextBlock[] | null
  brand?: {
    name?: string | null
    slug?: { current?: string | null } | null
    logo?: {
      alt?: string | null
      hotspot?: ImageHotspot | null
      crop?: ImageCrop | null
      url?: string | null
    } | null
  } | null
}[]
