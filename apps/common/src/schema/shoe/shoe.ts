import { defineArrayMember, defineField, defineType } from 'sanity'

export const shoeType = defineType({
  type: 'document',
  name: 'shoe',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: 'slug',
      name: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        isUnique: async (slug, context) => {
          const { document, getClient } = context
          if (!document?._type) {
            return true
          }
          const client = getClient({ apiVersion: '2023-10-12' })
          const query = /* groq */ `count(*[_type == $type && slug.current == $slug])`
          const result = await client.fetch<number>(
            query,
            {
              type: document._type,
              slug,
            },
            { perspective: 'previewDrafts' },
          )
          return result < 2
        },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: 'array',
      name: 'media',
      title: 'Media',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            // @ts-expect-error - @TODO add types
            captionField: 'alt',
          },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
          ],
        }),
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
