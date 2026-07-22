import {defineQuery} from 'groq'

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

export const layoutQuery = defineQuery(`
  *[_id == "siteSettings"][0]{
  title,
  description,
  copyrightText
}`)

export const frontPageQuery = defineQuery(`
  *[_id == "siteSettings"][0]{
    frontPage->{
      _type,
      _id,
      title,
      ${sectionFragment},
      style
    }
  }.frontPage
`)

export const pageQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _type,
    _id,
    title,
    ${sectionFragment},
    style
  }
`)

export const pageSlugsQuery = defineQuery(
  /* groq */ `*[_type == "page" && defined(slug.current)]{"slug": slug.current}`,
)

export const productsPageQuery = defineQuery(`
  *[_type == "product" && defined(slug.current)]{
    _id,
    title,
    description,
    slug,
    "media": media[0]
  }
`)

export const productPageQuery = defineQuery(
  /* groq */ `*[_type == "product" && slug.current == $slug][0]`,
)

export const productSlugsQuery = defineQuery(
  /* groq */ `*[_type == "product" && defined(slug.current)]{"slug": slug.current}`,
)

export const projectsPageQuery = defineQuery(
  /* groq */ `*[_type == "project" && defined(slug.current)]`,
)

export const projectPageQuery = defineQuery(
  /* groq */ `*[_type == "project" && slug.current == $slug][0]`,
)

export const projectSlugsQuery = defineQuery(
  /* groq */ `*[_type == "project" && defined(slug.current)]{"slug": slug.current}`,
)
