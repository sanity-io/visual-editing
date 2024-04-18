const Floor = {
  name: 'Floor',
  title: 'Floor',
  type: 'document',
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Name',
      name: 'name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Label',
      name: 'label',
      type: 'string',
    },
    {
      title: 'Spaces',
      name: 'spaces',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'Space'}],
        },
      ],
    },
  ],
}
export default Floor
