import {defineQuery} from 'next-sanity'

export const shoesList = defineQuery(`*[_type == "shoe" && defined(slug.current)]{
  title,
  slug,
  "price": string(price),
  "media": media[0]{ alt, asset, crop, hotspot },
  "brand": brandReference->{name, slug, logo{ alt, asset, crop, hotspot }},
} | order(_updatedAt desc) `)

export const shoe = defineQuery(`*[_type == "shoe" && slug.current == $slug]{
  title,
  slug,
  "price": string(price),
  "media": media[]{ alt, asset, crop, hotspot },
  "brand": brandReference->{name, slug, logo{ alt, asset, crop, hotspot }},
  description,
}[0]`)
