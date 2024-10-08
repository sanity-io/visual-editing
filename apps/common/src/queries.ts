import type {ImageAsset, ImageCrop, ImageHotspot, PortableTextTextBlock} from 'sanity'

export const shoesList = /* groq */ `*[_type == "shoe" && defined(slug.current)]{
  title,
  subtitle,
  slug,
  "price": string(price),
  "media": media[0]{ alt, asset, crop, hotspot },
  "brand": brandReference->{name, slug, logo{ alt, asset, crop, hotspot }},
} | order(_updatedAt desc) `
export type ShoesListResult = {
  title?: string | null
  subtitle?: string | null
  slug: {current: string}
  price?: string | null
  media?: {
    alt?: string | null
    asset?: ImageAsset | null
    crop?: ImageCrop | null
    hotspot?: ImageHotspot | null
  } | null
  description?: PortableTextTextBlock[] | null
  brand?: {
    name?: string | null
    slug?: {current?: string | null} | null
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
  subtitle,
  slug,
  "price": string(price),
  "media": media[]{ alt, asset, crop, hotspot },
  "brand": brandReference->{name, slug, logo{ alt, asset, crop, hotspot }},
  description,
}[0]`
export type ShoeParams = {slug: string}
export type ShoeResult = {
  title?: string | null
  slug: {current: string}
  price?: string | null
  media?: {
    alt?: string | null
    asset?: ImageAsset | null
    crop?: ImageCrop | null
    hotspot?: ImageHotspot | null
  }[]
  brand?: {
    name?: string | null
    slug?: {current?: string | null} | null
    logo?: {
      alt?: string | null
      asset?: ImageAsset | null
      crop?: ImageCrop | null
      hotspot?: ImageHotspot | null
    } | null
  } | null
  description?: PortableTextTextBlock[] | null
}
