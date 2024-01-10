const SpaceType = {
  name: 'SpaceType',
  title: 'Space Type',
  type: 'document',
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      validation: (Rule: any) =>
        Rule.required().min(1).error('Space Type Title is required.'),
    },
    {
      title: 'Name',
      name: 'name',
      type: 'string',
      validation: (Rule: any) =>
        Rule.required().min(1).error('Space Type Name is required.'),
    },
    {
      title: 'Value',
      name: 'value',
      type: 'string',
      initialValue: 'Space',
    },
    {
      title: 'System Id',
      name: 'systemId',
      type: 'string',
    },
  ],
}
export default SpaceType
