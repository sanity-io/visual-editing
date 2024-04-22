import {
  defineDocuments,
  defineLocations,
  type DocumentLocationResolvers,
} from '@sanity/presentation'

export const documentResolvers = defineDocuments([
  {
    path: '/shoes/:slug',
    mainDocument: {
      filter: `_type == "shoe" && slug.current == $slug`,
    },
  },
  {
    path: '/product/:slug',
    mainDocument: {
      filter: `_type == "product" && slug.current == $slug`,
    },
  },
  {
    path: '/shoes',
    mainDocument: {
      type: 'siteSettings',
    },
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
