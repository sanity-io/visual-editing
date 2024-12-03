// import {assist} from '@sanity/assist'
import {defineField, definePlugin, defineType} from 'sanity'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {structureTool} from 'sanity/structure'

const brandType = defineType(
  defineType({
    type: 'document',
    name: 'brand',
    fields: [
      defineField({
        type: 'string',
        name: 'name',
        title: 'Name',
      }),
      defineField({
        type: 'slug',
        name: 'slug',
        title: 'Slug',
        options: {source: 'name'},
      }),
      defineField({
        type: 'image',
        name: 'logo',
        title: 'Logo',
        options: {
          hotspot: true,
          // @ts-expect-error - this is fine
          aiAssist: {
            imageDescriptionField: 'alt',
            imageInstructionField: 'imagePrompt',
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
  }),
)

export const crossDatasetReferencesPlugin = definePlugin({
  name: '@repo/sanity-schema/cross-dataset-references',
  schema: {types: [brandType]},
  plugins: [
    // assist() , Assist is not supported yet in releases.
    unsplashImageAsset(),
    structureTool(),
  ],
})
