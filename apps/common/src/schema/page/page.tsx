import {defineField, defineType} from 'sanity'

import {pageSectionArrayMember} from './section'
import {featuredProductsSectionType} from './sections/featuredProducts'
import {featureHighlightSectionType} from './sections/featureHighlight'
import {heroSectionType} from './sections/hero'
import {introSectionType} from './sections/intro'

export const pageType = defineType({
  type: 'document',
  name: 'page',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    defineField({
      type: 'slug',
      name: 'slug',
      title: 'Slug',
      options: {source: 'title'},
      hidden: (ctx) => ['home', 'drafts.home'].includes(ctx.document?._id as string),
    }),
    defineField({
      type: 'array',
      name: 'sections',
      title: 'Sections',
      of: [
        heroSectionType,
        introSectionType,
        featuredProductsSectionType,
        featureHighlightSectionType,
        pageSectionArrayMember,
      ],
      options: {
        insertMenu: {
          filter: true,
          views: [
            {name: 'grid', previewImageUrl: (name: string) => `/static/preview-${name}.png`},
            {name: 'list'},
          ],
          groups: [
            {
              name: 'intro',
              title: 'Intro',
              of: ['hero', 'intro'],
            },
            {
              name: 'features',
              title: 'Features',
              of: ['featuredProducts', 'featureHighlight'],
            },
            {
              name: 'pages',
              title: 'Pages',
              of: ['section'],
            },
          ],
        },
      },
    }),
  ],
})
