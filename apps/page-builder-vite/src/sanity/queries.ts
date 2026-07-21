// Query strings are kept identical to apps/page-builder-demo so the
// generated types in src/sanity.types.ts remain accurate.

export const sectionFragment = /* groq */ `
sections[]{
  _key,
  _type,
  _type == 'section' => {
    'headline': coalesce(headline, symbol->headline),
    'tagline': coalesce(tagline, symbol->tagline),
    'subline': coalesce(subline, symbol->subline),
  },
  _type == 'featureHighlight' => {
    headline,
    description,
    image,
    product->{
      _type,
      _id,
      title,
      slug,
      "media": media[0]
    },
    style,
    ctas
  },
  _type == 'featuredProducts' => {
    headline,
    description,
    products[]{
      _key,
      ...(@->{
        _type,
        _id,
        title,
        slug,
        "media": media[0]
      })
    },
    style
  },
  _type == 'intro' => {
    headline,
    intro,
    style,
    rotations
  },
  _type == 'hero' => {
    headline,
    tagline,
    subline,
    image,
    style
  }
}`

export const layoutQuery = /* groq */ `
  *[_id == "siteSettings"][0]{
  title,
  description,
  copyrightText
}`

export const frontPageQuery = /* groq */ `
  *[_id == "siteSettings"][0]{
    frontPage->{
      _type,
      _id,
      title,
      ${sectionFragment},
      style
    }
  }.frontPage
`

export const pageQuery = /* groq */ `
  *[_type == "page" && slug.current == $slug][0]{
    _type,
    _id,
    title,
    ${sectionFragment},
    style
  }
`

export const productsPageQuery = /* groq */ `
  *[_type == "product" && defined(slug.current)]{
    _id,
    title,
    description,
    slug,
    "media": media[0]
  }
`

export const productPageQuery = /* groq */ `*[_type == "product" && slug.current == $slug][0]`
