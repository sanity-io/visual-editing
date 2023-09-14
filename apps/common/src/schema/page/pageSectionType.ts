import { defineField, defineType } from 'sanity'

export const pageSectionType = defineType({
  type: 'document',
  name: 'page.section',
  fields: [
    defineField({
      type: 'string',
      name: 'headline',
      title: 'Headline',
    }),
    defineField({
      type: 'string',
      name: 'tagline',
      title: 'Tagline',
    }),
    defineField({
      type: 'string',
      name: 'subline',
      title: 'Subline',
    }),
  ],
})
