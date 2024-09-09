/* eslint-disable @typescript-eslint/no-explicit-any */
import {definePlugin} from 'sanity'
import {structureTool} from 'sanity/structure'

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

const SpaceType = {
  name: 'SpaceType',
  title: 'Space Type',
  type: 'document',
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(1).error('Space Type Title is required.'),
    },
    {
      title: 'Name',
      name: 'name',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(1).error('Space Type Name is required.'),
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

export const performanceTestPlugin = definePlugin({
  name: '@repo/sanity-schema/performance-test',
  schema: {types: [Building, Floor, Space, SpaceType]},
  plugins: [structureTool()],
})
