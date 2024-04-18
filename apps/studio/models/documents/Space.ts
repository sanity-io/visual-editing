const Space = {
  name: 'Space',
  title: 'Space',
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
      title: 'Space Code',
      name: 'spaceCode',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Description',
      name: 'description',
      type: 'string',
    },
    {
      title: 'Contact Number',
      name: 'contactNumber',
      type: 'string',
    },
    {
      title: 'Capacity',
      name: 'capacity',
      type: 'number',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Is Reservable',
      name: 'isReservable',
      type: 'boolean',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Type',
      name: 'spaceType',
      type: 'array',
      validation: (Rule: any) => Rule.required(),
      of: [
        {
          type: 'reference',
          to: [{type: 'SpaceType'}],
        },
      ],
    },
    {
      title: 'Is Active',
      name: 'isActive',
      type: 'boolean',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Video Device Name',
      name: 'videoDevice',
      type: 'string',
    },
    {
      title: 'Display Device Name',
      name: 'displayDevice',
      type: 'string',
    },
    {
      title: 'Audio Device Name',
      name: 'audioDevice',
      type: 'string',
    },
    {
      title: 'Tags',
      name: 'exchangeTags',
      type: 'array',
      of: [
        {
          type: 'string',
        },
      ],
    },
    {
      title: 'Rating',
      name: 'rating',
      type: 'number',
    },
  ],
}

export default Space
