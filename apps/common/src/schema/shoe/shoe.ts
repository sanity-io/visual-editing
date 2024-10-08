import {defineArrayMember, defineField, defineType} from 'sanity'

export const shoeType = defineType({
  type: 'document',
  name: 'shoe',
  groups: [
    {
      default: true,
      name: 'details',
      title: 'Details',
    },
  ],
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
      validation: (rule) => rule.required(),
    }),
    defineField({
      group: 'details',
      type: 'string',
      name: 'subtitle',
      title: 'Subtitle',
    }),
    defineField({
      group: 'details',
      type: 'slug',
      name: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        isUnique: async (slug, context) => {
          const {document, getClient} = context
          if (!document?._type) {
            return true
          }
          const client = getClient({apiVersion: '2023-10-12'})
          const query = /* groq */ `count(*[_type == $type && slug.current == $slug])`
          const result = await client.fetch<number>(
            query,
            {
              type: document._type,
              slug,
            },
            {perspective: 'previewDrafts'},
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
            hotspot: true,
            // @ts-expect-error - find out how to get typings
            aiAssist: {
              imageDescriptionField: 'alt',
              imagePromptField: 'imagePromptField',
            },
          },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
            defineField({
              type: 'text',
              name: 'imagePrompt',
              title: 'Image prompt',
              rows: 2,
            }),
          ],
        }),
      ],
      options: {layout: 'grid'},
    }),
    defineField({
      type: 'array',
      name: 'description',
      title: 'Description',
      of: [{type: 'block'}],
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
      studioUrl: ({type, id}) =>
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
  preview: {
    select: {
      title: 'title',
      media: 'media.0.asset',
    },
  },
})
