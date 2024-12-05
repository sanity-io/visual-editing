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
