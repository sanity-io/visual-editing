import {defineQuery} from 'next-sanity'

export const SITE_SETTINGS_QUERY = defineQuery(`
*[_id == "siteSettings"][0]{
  title,
  copyrightText
}
`)

export const INDEX_PAGE_QUERY = defineQuery(`
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
`)

export const pageQuery = defineQuery(`
*[_type == "page" && _id == $id][0]{
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
`)
