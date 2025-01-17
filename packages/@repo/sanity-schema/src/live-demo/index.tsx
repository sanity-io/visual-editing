/* eslint-disable @typescript-eslint/no-explicit-any */
import {assist} from '@sanity/assist'
import {colorInput} from '@sanity/color-input'
import {CogIcon, DocumentTextIcon, UserIcon} from '@sanity/icons'
import {format, parseISO} from 'date-fns'
import {
  defineArrayMember,
  defineField,
  definePlugin,
  defineType,
  type DocumentDefinition,
} from 'sanity'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type DocumentLocation,
  type PresentationPluginOptions,
} from 'sanity/presentation'
import {structureTool, type StructureResolver} from 'sanity/structure'

const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

const authorType = defineType({
  name: 'author',
  title: 'Author',
  icon: UserIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'picture',
      title: 'Picture',
      type: 'image',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessiblity.',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              if ((context.document?.['picture'] as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        },
      ],
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      validation: (rule) => rule.required(),
    }),
  ],
})

const postType = defineType({
  name: 'post',
  title: 'Post',
  icon: DocumentTextIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'A slug is required for the post to show up in the preview',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessiblity.',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              if ((context.document?.['coverImage'] as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: authorType.name}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      date: 'date',
      media: 'coverImage',
    },
    prepare({title, media, author, date}) {
      const subtitles = [
        author && `by ${author}`,
        date && `on ${format(parseISO(date), 'LLL d, yyyy')}`,
      ].filter(Boolean)

      return {title, media, subtitle: subtitles.join(' ')}
    },
  },
})

const settingsType = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      description: 'This field is the title of your blog.',
      title: 'Title',
      type: 'string',
      initialValue: 'Blog.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description: 'Used both for the <meta> description tag for SEO, and the blog subheader.',
      title: 'Description',
      type: 'array',
      initialValue: [
        {
          _key: '9f1a629887fd',
          _type: 'block',
          children: [
            {
              _key: '4a58edd077880',
              _type: 'span',
              marks: [],
              text: 'A statically generated blog example using ',
            },
            {
              _key: '4a58edd077881',
              _type: 'span',
              marks: ['ec5b66c9b1e0'],
              text: 'Next.js',
            },
            {
              _key: '4a58edd077882',
              _type: 'span',
              marks: [],
              text: ' and ',
            },
            {
              _key: '4a58edd077883',
              _type: 'span',
              marks: ['1f8991913ea8'],
              text: 'Sanity',
            },
            {
              _key: '4a58edd077884',
              _type: 'span',
              marks: [],
              text: '.',
            },
          ],
          markDefs: [
            {
              _key: 'ec5b66c9b1e0',
              _type: 'link',
              href: 'https://nextjs.org/',
            },
            {
              _key: '1f8991913ea8',
              _type: 'link',
              href: 'https://sanity.io/',
            },
          ],
          style: 'normal',
        },
      ],
      of: [
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              defineField({
                type: 'object',
                name: 'link',
                fields: [
                  {
                    type: 'string',
                    name: 'href',
                    title: 'URL',
                    validation: (rule) => rule.required(),
                  },
                ],
              }),
            ],
          },
        }),
      ],
    }),
    defineField({
      type: 'object',
      name: 'theme',
      fields: [
        {
          type: 'color',
          name: 'background',
          title: 'Background Color',
        },
        {
          type: 'color',
          name: 'text',
          title: 'Text Color',
        },
      ],
    }),
    defineField({
      name: 'footer',
      description: 'This is a block of text that will be displayed at the bottom of the page.',
      title: 'Footer Info',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'Url',
                  },
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Displayed on social cards and search engine results.',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        defineField({
          name: 'alt',
          description: 'Important for accessibility and SEO.',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              if ((context.document?.['ogImage'] as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        }),
        defineField({
          name: 'metadataBase',
          type: 'url',
          description: (
            <a
              href="https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase"
              rel="noreferrer noopener"
            >
              More information
            </a>
          ),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Settings',
      }
    },
  },
})

const pageStructure = (typeDefArray: DocumentDefinition[]): StructureResolver => {
  return (S) => {
    // Goes through all of the singletons that were provided and translates them into something the
    // Structure tool can understand
    const singletonItems = typeDefArray.map((typeDef) => {
      return S.listItem()
        .title(typeDef.title!)
        .icon(typeDef.icon)
        .child(S.editor().id(typeDef.name).schemaType(typeDef.name).documentId(typeDef.name))
    })

    // The default root list items (except custom ones)
    const defaultListItems = S.documentTypeListItems().filter(
      (listItem) => !typeDefArray.find((singleton) => singleton.name === listItem.getId()),
    )

    return S.list()
      .title('Content')
      .items([...singletonItems, S.divider(), ...defaultListItems])
  }
}

const singletonPlugin = definePlugin((types: string[]) => {
  return {
    name: 'singletonPlugin',
    document: {
      newDocumentOptions: (prev, {creationContext}) => {
        if (creationContext.type === 'global') {
          return prev.filter((templateItem) => !types.includes(templateItem.templateId))
        }

        return prev
      },
      // Removes the "duplicate" action on the Singletons (such as Home)
      actions: (prev, {schemaType}) => {
        if (types.includes(schemaType)) {
          return prev.filter(({action}) => action !== 'duplicate')
        }

        return prev
      },
    },
  }
})

const assistWithPresets = () =>
  assist({
    __presets: {
      [postType.name]: {
        fields: [
          {
            /**
             * Creates Portable Text `content` blocks from the `title` field
             */
            path: 'content',
            instructions: [
              {
                _key: 'preset-instruction-1',
                title: 'Generate sample content',
                icon: 'block-content',
                prompt: [
                  {
                    _key: '86e70087d4d5',
                    markDefs: [],
                    children: [
                      {
                        _type: 'span',
                        marks: [],
                        text: 'Given the draft title ',
                        _key: '6b5d5d6a63cf0',
                      },
                      {
                        path: 'title',
                        _type: 'sanity.assist.instruction.fieldRef',
                        _key: '0132742d463b',
                      },
                      {
                        _type: 'span',
                        marks: [],
                        text: ' of a blog post, generate a comprehensive and engaging sample content that spans the length of one to two A4 pages. The content should be structured, informative, and tailored to the subject matter implied by the title, whether it be travel, software engineering, fashion, politics, or any other theme. The text will be displayed below the ',
                        _key: 'a02c9ab4eb2d',
                      },
                      {
                        _type: 'sanity.assist.instruction.fieldRef',
                        _key: 'f208ef240062',
                        path: 'title',
                      },
                      {
                        text: " and doesn't need to repeat it in the text. The generated text should include the following elements:",
                        _key: '8ecfa74a8487',
                        _type: 'span',
                        marks: [],
                      },
                    ],
                    _type: 'block',
                    style: 'normal',
                  },
                  {
                    style: 'normal',
                    _key: 'e4dded41ea89',
                    markDefs: [],
                    children: [
                      {
                        _type: 'span',
                        marks: [],
                        text: '1. Introduction: A brief paragraph that captures the essence of the blog post, hooks the reader with intriguing insights, and outlines the purpose of the post.',
                        _key: 'cc5ef44a2fb5',
                      },
                    ],
                    _type: 'block',
                  },
                  {
                    style: 'normal',
                    _key: '585e8de2fe35',
                    markDefs: [],
                    children: [
                      {
                        _type: 'span',
                        marks: [],
                        text: '2. Main Body:',
                        _key: 'fab36eb7c541',
                      },
                    ],
                    _type: 'block',
                  },
                  {
                    _type: 'block',
                    style: 'normal',
                    _key: 'e96b89ef6357',
                    markDefs: [],
                    children: [
                      {
                        _type: 'span',
                        marks: [],
                        text: '- For thematic consistency, divide the body into several sections with subheadings that explore different facets of the topic.',
                        _key: 'b685a310a0ff',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        marks: [],
                        text: '- Include engaging and informative content such as personal anecdotes (for travel or fashion blogs), technical explanations or tutorials (for software engineering blogs), satirical or humorous observations (for shitposting), or well-argued positions (for political blogs).',
                        _key: 'c7468d106c91',
                        _type: 'span',
                      },
                    ],
                    _type: 'block',
                    style: 'normal',
                    _key: 'ce4acdb00da9',
                    markDefs: [],
                  },
                  {
                    _type: 'block',
                    style: 'normal',
                    _key: 'fb4572e65833',
                    markDefs: [],
                    children: [
                      {
                        _type: 'span',
                        marks: [],
                        text: '- ',
                        _key: '5358f261dce4',
                      },
                      {
                        _type: 'span',
                        marks: [],
                        text: ' observations (for shitposting), or well-argued positions (for political blogs).',
                        _key: '50792c6d0f77',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        marks: [],
                        text: 'Where applicable, incorporate bullet points or numbered lists to break down complex information, steps in a process, or key highlights.',
                        _key: '3b891d8c1dde0',
                        _type: 'span',
                      },
                    ],
                    _type: 'block',
                    style: 'normal',
                    _key: '9364b67074ce',
                    markDefs: [],
                  },
                  {
                    _key: 'a6ba7579cd66',
                    markDefs: [],
                    children: [
                      {
                        _type: 'span',
                        marks: [],
                        text: '3. Conclusion: Summarize the main points discussed in the post, offer final thoughts or calls to action, and invite readers to engage with the content through comments or social media sharing.',
                        _key: '1280f11d499d',
                      },
                    ],
                    _type: 'block',
                    style: 'normal',
                  },
                  {
                    style: 'normal',
                    _key: '719a79eb4c1c',
                    markDefs: [],
                    children: [
                      {
                        marks: [],
                        text: "4. Engagement Prompts: Conclude with questions or prompts that encourage readers to share their experiences, opinions, or questions related to the blog post's topic, but keep in mind there is no Comments field below the blog post.",
                        _key: 'f1512086bab6',
                        _type: 'span',
                      },
                    ],
                    _type: 'block',
                  },
                  {
                    _type: 'block',
                    style: 'normal',
                    _key: '4a1c586fd44a',
                    markDefs: [],
                    children: [
                      {
                        marks: [],
                        text: 'Ensure the generated content maintains a balance between being informative and entertaining, to capture the interest of a wide audience. The sample content should serve as a solid foundation that can be further customized or expanded upon by the blog author to finalize the post.',
                        _key: '697bbd03cb110',
                        _type: 'span',
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        marks: [],
                        text: 'Don\'t prefix each section with "Introduction", "Main Body", "Conclusion" or "Engagement Prompts"',
                        _key: 'd20bb9a03b0d',
                        _type: 'span',
                      },
                    ],
                    _type: 'block',
                    style: 'normal',
                    _key: 'b072b3c62c3c',
                    markDefs: [],
                  },
                ],
              },
            ],
          },
          {
            /**
             * Summarize content into the `excerpt` field
             */
            path: 'excerpt',
            instructions: [
              {
                _key: 'preset-instruction-2',
                title: 'Summarize content',
                icon: 'blockquote',
                prompt: [
                  {
                    markDefs: [],
                    children: [
                      {
                        _key: '650a0dcc327d',
                        _type: 'span',
                        marks: [],
                        text: 'Create a short excerpt based on ',
                      },
                      {
                        path: 'content',
                        _type: 'sanity.assist.instruction.fieldRef',
                        _key: 'c62d14c73496',
                      },
                      {
                        _key: '38e043efa606',
                        _type: 'span',
                        marks: [],
                        text: " that doesn't repeat what's already in the ",
                      },
                      {
                        path: 'title',
                        _type: 'sanity.assist.instruction.fieldRef',
                        _key: '445e62dda246',
                      },
                      {
                        _key: '98cce773915e',
                        _type: 'span',
                        marks: [],
                        text: ' . Consider the UI has limited horizontal space and try to avoid too many line breaks and make it as short, terse and brief as possible. At best a single sentence, at most two sentences.',
                      },
                    ],
                    _type: 'block',
                    style: 'normal',
                    _key: '392c618784b0',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  })

export const liveDemoPlugin = definePlugin<
  Partial<PresentationPluginOptions> & Pick<PresentationPluginOptions, 'previewUrl'>
>((config) => ({
  name: '@repo/sanity-schema/live-demo',
  schema: {
    types: [
      // Singletons
      settingsType,
      // Documents
      postType,
      authorType,
    ],
  },
  plugins: [
    colorInput(),
    presentationTool({
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: '/posts/:slug',
            filter: `_type == "post" && slug.current == $slug`,
          },
        ]),
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: 'This document is used on all pages',
            tone: 'caution',
          }),
          post: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: doc?.slug
                ? [
                    {
                      title: doc?.title || 'Untitled',
                      href: `/posts/${doc.slug}`,
                    },
                    homeLocation,
                  ]
                : [homeLocation],
            }),
          }),
        },
      },
      ...config,
    }),
    structureTool({structure: pageStructure([settingsType])}),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    singletonPlugin([settingsType.name]),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    // Sets up AI Assist with preset prompts
    // https://www.sanity.io/docs/ai-assist
    assistWithPresets(),
  ],
}))
