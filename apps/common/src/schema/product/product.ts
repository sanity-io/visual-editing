import {defineArrayMember, defineField, defineType} from 'sanity'

export const productType = defineType({
  type: 'document',
  name: 'product',
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
      options: {layout: 'grid'},
    }),
    defineField({
      type: 'object',
      name: 'model',
      title: 'Model',
      fields: [
        defineField({
          type: 'file',
          name: 'file',
          options: {storeOriginalFilename: true},
        }),

        defineField({
          type: 'object',
          name: 'light',
          title: 'Light',
          hidden: true,
          fields: [
            defineField({
              type: 'number',
              name: 'intensity',
              initialValue: 0,
            }),
          ],
        }),
        defineField({
          type: 'object',
          name: 'rotation',
          title: 'Rotation',
          hidden: true,
          fields: [
            defineField({
              type: 'number',
              name: 'x',
              initialValue: 0,
            }),
            defineField({
              type: 'number',
              name: 'y',
              initialValue: 0,
            }),
            defineField({
              type: 'number',
              name: 'z',
              initialValue: 0,
            }),
          ],
        }),
      ],
    }),
    defineField({
      type: 'array',
      name: 'description',
      title: 'Description',
      of: [{type: 'block'}],
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
    defineField({
      type: 'object',
      name: 'details',
      title: 'Details',
      fields: [
        defineField({
          type: 'string',
          name: 'materials',
          title: 'Materials',
        }),
        defineField({
          type: 'array',
          name: 'collectionNotes',
          title: 'Collection notes',
          of: [{type: 'block'}],
        }),
        defineField({
          type: 'array',
          name: 'performance',
          title: 'Performance',
          of: [{type: 'block'}],
        }),
        defineField({
          type: 'string',
          name: 'ledLifespan',
          title: 'LED lifespan',
        }),
        defineField({
          type: 'array',
          name: 'certifications',
          title: 'Certifications',
          of: [{type: 'string'}],
        }),
      ],
    }),
    defineField({
      type: 'array',
      name: 'variants',
      title: 'Variants',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'variant',
          title: 'Variant',
          fields: [
            defineField({
              type: 'string',
              name: 'title',
              title: 'Title',
            }),
            defineField({
              type: 'string',
              name: 'price',
              title: 'Price',
            }),
            defineField({
              type: 'string',
              name: 'sku',
              title: 'SKU',
            }),
          ],
        }),
      ],
    }),
  ],
})
