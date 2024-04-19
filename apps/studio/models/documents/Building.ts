const Building = {
  name: 'Building',
  title: 'Building',
  type: 'document',
  fields: [
    {
      title: 'Building Title',
      name: 'title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'name',
      title: 'Name',
      description: 'Displayed in Campus App UI',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'address',
      title: 'Building Address',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Postal Code',
      name: 'zip',
      type: 'string',
    },
    {
      title: 'Building Description',
      name: 'buildingDescription',
      type: 'string',
    },
    {
      title: 'Building Status',
      name: 'status',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
      options: {
        list: [
          {title: 'Closed', value: '1a'},
          {title: 'Open', value: '2a'},
        ],
        layout: 'radio',
      },
    },
    {
      title: 'Building Id',
      name: 'buildingId',
      type: 'string',
      readOnly: true,
    },
    {
      title: 'Building Location',
      name: 'location',
      type: 'geopoint',
    },
    {
      title: 'Building Timezone',
      name: 'timezone',
      type: 'string',
    },
    {
      title: 'Floors',
      name: 'floors',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'Floor'}],
        },
      ],
    },
    {
      title: 'Promoted Building',
      name: 'promotedBuilding',
      type: 'boolean',
      initialValue: false,
      readOnly: false,
    },
  ],
}
export default Building
