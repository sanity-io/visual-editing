import { defineField, defineType } from 'sanity'

export const shoeType = defineType({
  type: 'document',
  name: 'shoe',
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
    defineField({
      type: 'array',
      name: 'media',
      title: 'Media',
      of: [
        {
          type: 'image',
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
          ],
        },
      ],
      options: { layout: 'grid' },
    }),
    defineField({
      type: 'array',
      name: 'description',
      title: 'Description',
      of: [{ type: 'block' }],
    }),
    defineField({
      type: 'number',
      name: 'price',
      title: 'Price',
    }),
    defineField({
      title: 'Brand',
      name: 'brandReference',
      type: 'crossDatasetReference',
      dataset: 'cross-dataset-references',
      studioUrl: ({ type, id }) =>
        new URL(
          `/cross-dataset-references/desk/intent/edit/id=${id};type=${type}/`,
          location.href,
        ).toString(),
      to: [
        {
          type: 'brand',
          preview: {
            select: {
              title: 'name',
              media: 'logo',
            },
          },
        },
      ],
    }),
  ],
})
