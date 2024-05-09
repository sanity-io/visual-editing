import {
  defineDocuments,
  defineLocations,
  type DocumentLocationResolvers,
} from '@sanity/presentation'

export const mainDocumentResolvers = defineDocuments([
  {
    route: '/shoes/:slug',
    filter: `_type == "shoe" && slug.current == $slug`,
  },
  {
    route: '/product/:slug',
    filter: `_type == "product" && slug.current == $slug`,
  },
  {
    route: '/products',
    filter: `_type == "page" && slug.current == "products"`,
  },
  {
    route: '/',
    filter: `_type == "page" && (*[_id == "siteSettings"][0].frontPage._ref == _id)`,
  },
])

export const documentLocationResolvers = {
  shoe: defineLocations({
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || 'Untitled',
          href: `/shoes/${doc?.slug}`,
        },
        {
          title: 'Shoes',
          href: '/shoes',
        },
      ],
    }),
  }),
  product: defineLocations({
    select: {
      title: 'title',
      slug: 'slug',
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || 'Untitled',
          href: `/product/${doc?.slug?.current}`,
        },
        {
          title: 'Products',
          href: '/products',
        },
      ],
    }),
  }),
  siteSettings: defineLocations({
    message: 'This document is used on all pages',
    tone: 'caution',
  }),
} satisfies DocumentLocationResolvers
