export const productsList = /* groq */ `*[_type == "product"]{
  title,
  slug,
  "media": media[0]{alt, hotspot,crop,"url": asset->url},
  description,
  "brand": brandReference->{name, slug, logo{alt, hotspot,crop,"url": asset->url}},
}`
