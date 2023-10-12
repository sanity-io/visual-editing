import type {
  ImageAsset,
  ImageCrop,
  ImageHotspot,
  PortableTextTextBlock,
} from 'sanity'

export const shoesList = /* groq */ `*[_type == "shoe" && defined(slug.current)]{
  title,
  slug,
  price,
  "media": media[0]{ alt, asset, crop, hotspot },
  description,
  "brand": brandReference->{name, slug, logo{ alt, asset, crop, hotspot }},
}`
export type ShoesListResult = {
  title?: string | null
  slug: { current: string }
  price?: number | null
  media?: {
    alt?: string | null
    asset?: ImageAsset | null
    crop?: ImageCrop | null
    hotspot?: ImageHotspot | null
  } | null
  description?: PortableTextTextBlock[] | null
  brand?: {
    name?: string | null
    slug?: { current?: string | null } | null
    logo?: {
      alt?: string | null
      asset?: ImageAsset | null
      crop?: ImageCrop | null
      hotspot?: ImageHotspot | null
    } | null
  } | null
}[]

export const shoe = /* groq */ `*[_type == "shoe" && slug.current == $slug]{
  title,
  slug,
  price,
  "media": media{ alt, asset, crop, hotspot },
  description,
}[0]`
export type ShoeParams = { slug: string }
export type ShoeResult = {
  title?: string | null
  slug: { current: string }
  price?: number | null
  media?: {
    alt?: string | null
    asset?: ImageAsset | null
    crop?: ImageCrop | null
    hotspot?: ImageHotspot | null
  }[]
  description?: PortableTextTextBlock[] | null
}
