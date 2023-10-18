import groq from 'groq'

export const SITE_SETTINGS_QUERY = groq`
*[_id == "siteSettings"][0]{
  title,
  copyrightText
}
`

export const INDEX_PAGE_QUERY = groq`
*[_id == "siteSettings"][0]{
  frontPage->{
    _type,
    _id,
    title,
    sections[]{
      ...,
      symbol->{_type},
      'headline': coalesce(headline, symbol->headline),
      'tagline': coalesce(tagline, symbol->tagline),
      'subline': coalesce(subline, symbol->subline),
      product->{
        _type,
        _id,
        title,
        slug,
        "media": media[0]
      },
      products[]->{
        '_key': _id,
        _type,
        _id,
        title,
        slug,
        "media": media[0]
      }
    },
    style
  }
}.frontPage
`
