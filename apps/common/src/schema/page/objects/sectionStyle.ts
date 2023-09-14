import { defineField, defineType } from 'sanity'

export const sectionStyleType = defineType({
  type: 'object',
  name: 'sectionStyle',
  title: 'Section style',
  fields: [
    defineField({
      type: 'string',
      name: 'variant',
      title: 'Variant',
      options: {
        list: [
          {
            title: 'Default',
            value: 'default',
          },
          {
            title: 'Inverted',
            value: 'inverted',
          },
        ],
      },
      initialValue: 'default',
      validation: (rule) => rule.required(),
    }),
  ],
})
