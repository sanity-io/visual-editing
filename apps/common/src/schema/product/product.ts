import { defineArrayMember, defineField, defineType } from 'sanity'

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
      options: { source: 'title' },
    }),
    defineField({
      type: 'array',
      name: 'media',
      title: 'Media',
      of: [{ type: 'image' }],
      options: { layout: 'grid' },
    }),
    defineField({
      type: 'array',
      name: 'description',
      title: 'Description',
      of: [{ type: 'block' }],
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
          of: [{ type: 'block' }],
        }),
        defineField({
          type: 'array',
          name: 'performance',
          title: 'Performance',
          of: [{ type: 'block' }],
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
          of: [{ type: 'string' }],
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
