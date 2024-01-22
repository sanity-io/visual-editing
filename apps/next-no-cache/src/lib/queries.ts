export const postFields = /* groq */ `
  ...,
  "slug": slug.current,
  "publishedAt": coalesce(publishedAt, _updatedAt),
`

export const latestPostQuery = /* groq */ `
*[_type == "post"] | order(publishedAt desc, _updatedAt desc) [0] {
  ${postFields}
}`

export const postQuery = /* groq */ `
{
  "post": *[_type == "post" && slug.current == $slug] | order(_updatedAt desc) [0] {
    content,
    ${postFields}
  },
  "morePosts": *[_type == "post" && slug.current != $slug] | order(date desc, _updatedAt desc) [0...2] {
    content,
    ${postFields}
  }
}`

export const postSlugsQuery = /* groq */ `
*[_type == "post" && defined(slug.current)][].slug.current
`

export const postBySlugQuery = /* groq */ `
*[_type == "post" && slug.current == $slug][0] {
  ${postFields}
}
`
