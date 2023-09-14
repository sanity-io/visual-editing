import { defineField, defineType } from 'sanity'

export const projectType = defineType({
  type: 'document',
  name: 'project',
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
      options: { source: 'title' },
    }),
  ],
})
