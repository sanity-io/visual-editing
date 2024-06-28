import {defineArrayMember, defineField, defineType} from 'sanity'

import {pageSectionArrayMember} from './section'
import {featuredProductsSectionType} from './sections/featuredProducts'
import {featureHighlightSectionType} from './sections/featureHighlight'
import {heroSectionType} from './sections/hero'
import {introSectionType} from './sections/intro'

const fields = [
  defineField({
    type: 'string',
    name: 'title',
  }),
]
const filler = [
  defineArrayMember({
    type: 'object',
    name: 'foo',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'bar',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'baz',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'qux',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'quux',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'corge',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'grault',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'garply',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'waldo',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'fred',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'plugh',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'xyzzy',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'thud',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'oogle',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'foogle',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'boogle',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'zork',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'gork',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'bork',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'bingo',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'bango',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'bongo',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'azonto',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'ngai',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'motema',
    fields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'bolingo',
    fields,
  }),
]

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
        // ...filler,
      ],
      options: {
        insertMenu: {
          filter: true,
          views: [
            {name: 'grid', previewImageUrl: (name) => `/static/preview-${name}.png`},
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
