import { defineArrayMember, defineField } from 'sanity'

export const featuredProductsSectionType = defineArrayMember({
  type: 'object',
  name: 'featuredProducts',
  title: 'Featured Products',
  fields: [
    defineField({
      type: 'string',
      name: 'headline',
      title: 'Headline',
    }),
    defineField({
      type: 'array',
      name: 'products',
      title: 'Products',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        },
      ],
    }),
    defineField({
      type: 'sectionStyle',
      name: 'style',
      title: 'Style',
    }),
  ],
  preview: {
    select: {
      title: 'headline',
    },
    prepare(data) {
      return {
        ...data,
        subtitle: 'Featured Products',
      }
    },
  },
})
