import {workspaces} from '@repo/env'
import {ControlsIcon} from '@sanity/icons'
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type PresentationPluginOptions,
} from '@sanity/presentation'
import {defineArrayMember, defineField, definePlugin, defineType} from 'sanity'
import {structureTool} from 'sanity/structure'
import {PageSectionInput} from './PageSectionInput'

const {dataset, workspace, tool} = workspaces['cross-dataset-references']

const productType = defineType({
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
      options: {source: 'title'},
    }),
    defineField({
      type: 'array',
      name: 'media',
      // @ts-expect-error this is actually allowed at runtime
      title: <>Media</>,
      // title: 'Media',
      of: [
        {
          type: 'image',
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
          ],
        },
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
          of: [{type: 'block'}],
        }),
        defineField({
          type: 'array',
          name: 'performance',
          title: 'Performance',
          of: [{type: 'block'}],
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
          of: [{type: 'string'}],
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

const projectType = defineType({
  type: 'document',
  name: 'project',
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
      options: {source: 'title'},
    }),
  ],
})

const siteSettingsType = defineType({
  type: 'document',
  icon: ControlsIcon,
  name: 'siteSettings',
  title: 'Site Settings',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Site Title',
    },
    {
      type: 'string',
      name: 'description',
      title: 'Site Description',
    },
    {
      type: 'reference',
      name: 'frontPage',
      title: 'Front page',
      to: [{type: 'page'}],
    },
    {
      type: 'string',
      name: 'copyrightText',
      title: 'Copyright text',
    },
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})

const pageSectionType = defineType({
  type: 'document',
  name: 'page.section',
  fields: [
    defineField({
      type: 'string',
      name: 'headline',
      title: 'Headline',
    }),
    defineField({
      type: 'string',
      name: 'tagline',
      title: 'Tagline',
    }),
    defineField({
      type: 'string',
      name: 'subline',
      title: 'Subline',
    }),
  ],
})

const pageSectionArrayMember = defineArrayMember({
  type: 'object',
  name: 'section',
  fields: [
    defineField({
      type: 'reference',
      name: 'symbol',
      title: 'Symbol',
      to: [{type: 'page.section'}],
    }),

    // overrides
    ...pageSectionType.fields,
  ],
  components: {
    input: PageSectionInput,
  },
})

const sectionStyleType = defineType({
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

const featuredProductsSectionType = defineArrayMember({
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
      type: 'string',
      name: 'description',
      title: 'Description',
    }),
    defineField({
      type: 'array',
      name: 'products',
      title: 'Products',
      of: [
        {
          type: 'reference',
          to: [{type: 'product'}],
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

const heroSectionType = defineArrayMember({
  type: 'object',
  name: 'hero',
  title: 'Hero',
  description: 'The hero section of the page',
  fields: [
    defineField({
      type: 'string',
      name: 'headline',
      title: 'Headline',
    }),
    defineField({
      type: 'string',
      name: 'tagline',
      title: 'Tagline',
    }),
    defineField({
      type: 'string',
      name: 'subline',
      title: 'Subline',
    }),
    defineField({
      type: 'image',
      name: 'image',
      title: 'Image',
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
        subtitle: 'Hero',
      }
    },
  },
})

const introSectionType = defineArrayMember({
  type: 'object',
  name: 'intro',
  title: 'Intro',
  fields: [
    defineField({
      type: 'string',
      name: 'headline',
      title: 'Headline',
    }),
    defineField({
      type: 'text',
      name: 'intro',
      title: 'Intro',
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
        subtitle: 'Intro',
      }
    },
  },
})

const featureHighlightSectionType = defineArrayMember({
  type: 'object',
  name: 'featureHighlight',
  title: 'Feature Highlight',
  fields: [
    defineField({
      type: 'string',
      name: 'headline',
      title: 'Headline',
    }),
    defineField({
      type: 'text',
      name: 'description',
      title: 'Description',
    }),
    defineField({
      type: 'image',
      name: 'image',
      title: 'Image',
    }),
    defineField({
      type: 'array',
      name: 'ctas',
      title: 'CTAs',
      of: [
        {
          type: 'object',
          name: 'cta',
          title: 'CTA',
          fields: [
            defineField({
              type: 'string',
              name: 'title',
              title: 'Title',
            }),
            defineField({
              type: 'string',
              name: 'href',
              title: 'Href',
            }),
          ],
        },
      ],
    }),
    defineField({
      type: 'reference',
      name: 'product',
      title: 'Product',
      to: [{type: 'product'}],
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
        subtitle: 'Feature',
      }
    },
  },
})

const pageType = defineType({
  type: 'document',
  name: 'page',
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
      options: {source: 'title'},
      hidden: (ctx) => ['home', 'drafts.home'].includes(ctx.document?._id as string),
    }),
    defineField({
      type: 'array',
      name: 'sections',
      title: 'Sections',
      of: [
        heroSectionType,
        introSectionType,
        featuredProductsSectionType,
        featureHighlightSectionType,
        pageSectionArrayMember,
      ],
    }),
  ],
})

const dndTestItemChildL2 = defineArrayMember({
  type: 'object',
  name: 'dndTestItemChildL2',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
  ],
})
const dndTestItemChildL1 = defineArrayMember({
  type: 'object',
  name: 'dndTestItemChildL1',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    defineField({
      type: 'array',
      name: 'children',
      title: 'Children',
      of: [dndTestItemChildL2],
    }),
  ],
})
const dndTestItemRoot = defineArrayMember({
  type: 'object',
  name: 'dndTestItem',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    defineField({
      type: 'array',
      name: 'children',
      title: 'Children',
      of: [dndTestItemChildL1],
    }),
    defineField({
      type: 'array',
      name: 'childrenStrings',
      title: 'Children Strings',
      of: [{type: 'string'}],
    }),
  ],
})
const dndTestPageType = defineType({
  type: 'document',
  name: 'dndTestPage',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    defineField({
      type: 'array',
      name: 'children',
      title: 'Children',
      of: [dndTestItemRoot],
    }),
  ],
})

export const pageBuilderDemoPlugin = definePlugin<
  Partial<PresentationPluginOptions> & Pick<PresentationPluginOptions, 'previewUrl'>
>((config) => ({
  name: '@repo/sanity-schema/page-builder-demo',
  schema: {
    types: [
      dndTestPageType,
      pageType,
      pageSectionType,
      productType,
      projectType,
      siteSettingsType,
      heroSectionType,
      introSectionType,
      featuredProductsSectionType,
      featureHighlightSectionType,
      sectionStyleType,
      pageSectionArrayMember,
    ],
    templates: [
      {
        id: 'page-basic',
        title: 'Basic page',
        schemaType: 'page',
        parameters: [{name: 'title', title: 'Page Title', type: 'string'}],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (params: any) => {
          return {
            title: params.title,
            slug: {
              current: 'basic-slug',
            },
          }
        },
      },
    ],
  },
  plugins: [
    presentationTool({
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: '/product/:slug',
            filter: `_type == "product" && slug.current == $slug`,
          },
          {
            route: '/products',
            filter: `_type == "page" && slug.current == "products"`,
          },
          {
            route: '/',
            filter: `_type == "page" && (*[_id == "siteSettings"][0].frontPage._ref == _id)`,
          },
          {
            route: '/dnd',
            filter: `_type == "dndTestPage"`,
          },
        ]),
        locations: {
          page: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: doc?.slug
                ? [
                    {
                      title: doc?.title || 'Untitled',
                      href: `/pages/${doc.slug}`,
                    },
                  ]
                : undefined,
            }),
          }),
          product: defineLocations({
            select: {
              title: 'title',
              slug: 'slug',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: `/product/${doc?.slug?.current}`,
                },
                {
                  title: 'Products',
                  href: '/products',
                },
              ],
            }),
          }),
          siteSettings: defineLocations({
            message: 'This document is used on all pages',
            tone: 'caution',
          }),
        },
      },
      ...config,
    }),
    structureTool(),
  ],
}))
