import {apiVersion, workspaces} from '@repo/env'
import {assist} from '@sanity/assist'
import {defineArrayMember, defineField, definePlugin, defineType} from 'sanity'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type PresentationPluginOptions,
} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'

const {dataset, workspace, tool} = workspaces['cross-dataset-references']

const shoeType = defineType({
  type: 'document',
  name: 'shoe',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: 'slug',
      name: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        isUnique: async (slug, context) => {
          const {document, getClient} = context
          if (!document?._type) {
            return true
          }
          const client = getClient({apiVersion})
          const query = /* groq */ `count(*[_type == $type && slug.current == $slug])`
          const result = await client.fetch<number>(
            query,
            {
              type: document._type,
              slug,
            },
            {perspective: 'drafts'},
          )
          return result < 2
        },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: 'array',
      name: 'media',
      title: 'Media',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
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
      options: {layout: 'grid'},
    }),
    defineField({
      type: 'array',
      name: 'description',
      title: 'Description',
      of: [{type: 'block'}],
    }),
    defineField({
      type: 'number',
      name: 'price',
      title: 'Price',
    }),
    defineField({
      title: 'Brand',
      name: 'brandReference',
      type: 'crossDatasetReference',
      dataset,
      studioUrl: ({type, id}) =>
        new URL(
          `/${workspace}/${tool}/intent/edit/id=${id};type=${type}/`,
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
  ],
  preview: {
    select: {
      title: 'title',
      media: 'media.0.asset',
    },
  },
})

export const shoesPlugin = definePlugin<
  Partial<PresentationPluginOptions> & Pick<PresentationPluginOptions, 'previewUrl'>
>((config) => ({
  name: '@repo/sanity-schema/shoes',
  schema: {types: [shoeType]},
  plugins: [
    assist(),
    unsplashImageAsset(),
    presentationTool({
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: '/shoes/:slug',
            filter: `_type == "shoe" && slug.current == $slug`,
          },
        ]),
        locations: {
          shoe: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: `/shoes/${doc?.slug}`,
                },
                {
                  title: 'Shoes',
                  href: '/shoes',
                },
              ],
            }),
          }),
        },
        ...config.resolve,
      },
      ...config,
    }),
    structureTool(),
  ],
}))
