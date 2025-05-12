import {defineQuery} from 'groq'

export const shoesListQuery = defineQuery(`*[_type == "shoe" && defined(slug.current)]{
  title,
  slug,
  "price": string(price),
  "media": media[0]{ alt, asset, crop, hotspot },
  "brand": brandReference->{name, slug, logo{ alt, asset, crop, hotspot }},
} | order(_updatedAt desc)`)

export const shoeQuery = defineQuery(`*[_type == "shoe" && slug.current == $slug]{
  _id,
  title,
  slug,
  "price": string(price),
  "media": media[]{ alt, asset, crop, hotspot, _key },
  "brand": brandReference->{name, slug, logo{ alt, asset, crop, hotspot }},
  description,
}[0]`)

export type ShoeParams = {slug: string}
