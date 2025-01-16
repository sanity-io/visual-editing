import type {ContentSourceMap} from '@sanity/client'

interface SanityReferenceValue {
  _type: 'reference'
  _ref: string
}

interface SanityImageHotspotValue {
  _type: 'sanity.imageHotspot'
  x: number
  y: number
  width: number
  height: number
}

interface SanityImageCropValue {
  _type: 'sanity.imageCrop'
  top: number
  left: number
  right: number
  bottom: number
}

interface SanityImageValue {
  _type: 'image'
  asset: SanityReferenceValue | null
  crop: SanityImageCropValue | null
  hotspot: SanityImageHotspotValue | null
}

interface Fixture<T> {
  // query: string
  result: T
  resultSourceMap: ContentSourceMap
  // ms: number
}

export const response1: Fixture<{_id: string; title: string}[]> = {
  // query: '*[_type=="shoe"]{_id,title}',
  result: [
    {
      _id: '0e6fa235-3bd5-41cc-9f25-53dc0a5ff7d2',
      title: 'Nike Pegasus 39 Shield',
    },
    {
      _id: '1a6b5074-2451-452f-9ab1-bb05119e2f7d',
      title: "Neon Flash - Gen Z's Ultimate Nike Sneaker",
    },
    {
      _id: '1b4a38e8-cac4-42c1-ba42-ac56af9095d0',
      title: 'Galaxy Runner',
    },
    {
      _id: '76f1ace0-b04a-4cff-9063-681214581279',
      title: 'Adidas Ultra Boost',
    },
    {
      _id: '77f2a8c8-f3f0-4807-93b2-61f1f648c711',
      title: 'Hover Hype: Float in Style with Hot Pink \u0026 Lilac',
    },
    {
      _id: '7ee961e0-926e-4dd7-b289-57bfa4d02be4',
      title: 'Invincible Tactical Boots: Unleash Your Inner Warrior',
    },
    {
      _id: '86e68b0c-2b5a-40cb-86ee-02eb885a080a',
      title: 'PUMA x SPARCO Speedcat OG Driving Shoes',
    },
    {
      _id: 'b956cf7b-a7b7-4e56-a16f-bad8ee392e34',
      title: 'Test shoe',
    },
    {
      _id: 'c4006b45-ae6e-4475-b270-fcdae2a7b455',
      title: 'StreetStrut Cyberpunk Super Sneakers: Ultimate Footwear Fantasy',
    },
    {
      _id: 'f4b80931-1d1d-411f-97ce-2d2f66aa3c23',
      title: 'Purple Fairy Dream Sneakers: Step into Magic!',
    },
  ],
  resultSourceMap: {
    documents: [
      {_id: '0e6fa235-3bd5-41cc-9f25-53dc0a5ff7d2', _type: 'shoe'},
      {_id: '1a6b5074-2451-452f-9ab1-bb05119e2f7d', _type: 'shoe'},
      {_id: '1b4a38e8-cac4-42c1-ba42-ac56af9095d0', _type: 'shoe'},
      {_id: '76f1ace0-b04a-4cff-9063-681214581279', _type: 'shoe'},
      {_id: '77f2a8c8-f3f0-4807-93b2-61f1f648c711', _type: 'shoe'},
      {_id: '7ee961e0-926e-4dd7-b289-57bfa4d02be4', _type: 'shoe'},
      {_id: '86e68b0c-2b5a-40cb-86ee-02eb885a080a', _type: 'shoe'},
      {_id: 'b956cf7b-a7b7-4e56-a16f-bad8ee392e34', _type: 'shoe'},
      {_id: 'c4006b45-ae6e-4475-b270-fcdae2a7b455', _type: 'shoe'},
      {_id: 'f4b80931-1d1d-411f-97ce-2d2f66aa3c23', _type: 'shoe'},
    ],
    paths: ["$['_id']", "$['title']"],
    mappings: {
      "$[0]['_id']": {
        source: {document: 0, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[0]['title']": {
        source: {document: 0, path: 1, type: 'documentValue'},
        type: 'value',
      },
      "$[1]['_id']": {
        source: {document: 1, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[1]['title']": {
        source: {document: 1, path: 1, type: 'documentValue'},
        type: 'value',
      },
      "$[2]['_id']": {
        source: {document: 2, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[2]['title']": {
        source: {document: 2, path: 1, type: 'documentValue'},
        type: 'value',
      },
      "$[3]['_id']": {
        source: {document: 3, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[3]['title']": {
        source: {document: 3, path: 1, type: 'documentValue'},
        type: 'value',
      },
      "$[4]['_id']": {
        source: {document: 4, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[4]['title']": {
        source: {document: 4, path: 1, type: 'documentValue'},
        type: 'value',
      },
      "$[5]['_id']": {
        source: {document: 5, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[5]['title']": {
        source: {document: 5, path: 1, type: 'documentValue'},
        type: 'value',
      },
      "$[6]['_id']": {
        source: {document: 6, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[6]['title']": {
        source: {document: 6, path: 1, type: 'documentValue'},
        type: 'value',
      },
      "$[7]['_id']": {
        source: {document: 7, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[7]['title']": {
        source: {document: 7, path: 1, type: 'documentValue'},
        type: 'value',
      },
      "$[8]['_id']": {
        source: {document: 8, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[8]['title']": {
        source: {document: 8, path: 1, type: 'documentValue'},
        type: 'value',
      },
      "$[9]['_id']": {
        source: {document: 9, path: 0, type: 'documentValue'},
        type: 'value',
      },
      "$[9]['title']": {
        source: {document: 9, path: 1, type: 'documentValue'},
        type: 'value',
      },
    },
  },
  // ms: 7,
}

export const response2: Fixture<{
  _rev: string
  _id: string
  _createdAt: string
  _updatedAt: string
  _type: 'screen'
  title: string | null
  seo: {
    _type: 'seo'
    og: {
      image: SanityImageValue | null
      title: string | null
      type: 'website' | null
    } | null
    twitter: {
      cardType: 'summary_large_image' | null
    } | null
  } | null
  content: null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sections: any[]
}> = {
  result: {
    _rev: 'UADaRbQgysuF6xTc3iuuSs',
    seo: {
      og: {
        image: {
          hotspot: {
            _type: 'sanity.imageHotspot',
            width: 0.5983606557377046,
            x: 0.4999999999999998,
            y: 0.5072924566828072,
            height: 0.8896797153024915,
          },
          _type: 'image',
          asset: {
            _ref: 'image-0bd7762ef992748e8ddfc9eeefee15e89ce1b31a-3840x2160-png',
            _type: 'reference',
          },
          crop: {
            left: 0.1188524590163935,
            bottom: 0,
            _type: 'sanity.imageCrop',
            right: 0.12090163934426235,
            top: 0,
          },
        },
        title: 'Build accessible React apps faster with Sanity UI',
        type: 'website',
      },
      twitter: {
        cardType: 'summary_large_image',
      },
      _type: 'seo',
    },
    _updatedAt: '2021-05-26T17:01:58Z',
    sections: [
      {
        ctas: [
          {
            _type: 'cta',
            href: '/docs',
            label: 'Get started',
            _key: 'f3064da3bffd',
            mode: 'default',
            tone: 'primary',
          },
        ],
        headline: 'Build accessible React apps faster with Sanity UI',
        linksHeader: 'Why Sanity UI?',
        backgroundImage: {
          light: {
            _type: 'image',
            asset: {
              _ref: 'image-6fa4d69d8e0dcce0659267db4b7bcf7e918092ae-3000x800-png',
              _type: 'reference',
            },
          },
          dark: {
            _type: 'image',
            asset: {
              _ref: 'image-d70c61f86d8941f941d4a81b27773701a8fe6332-3000x800-png',
              _type: 'reference',
            },
          },
        },
        _type: 'screenSection.hero',
        links: [
          {
            href: '/docs/motivation#accessibility-as-constraint',
            _key: 'dfe7bfafb5f9',
            title: 'Accessible',
            subtitle: 'Designed with accessibility as a (beautiful) constraint.',
            _type: 'link',
          },
          {
            _key: 'f6ae66a1ad9f',
            title: 'Highly composable',
            subtitle: 'Great DX with carefully designed APIs and UI principles.',
            _type: 'link',
            href: '/docs/motivation#built-for-composition',
          },
          {
            _key: '71fccc9c6b9b',
            title: 'Themeable with JS',
            subtitle: 'A flexible system for theming with design tokens.',
            _type: 'link',
            href: '/docs/motivation#theming-with-javascript',
          },
          {
            _type: 'link',
            href: '/docs/motivation#layout-primitives',
            _key: '430b4a0eec82',
            title: 'Layout primitives',
            subtitle: 'Apply common layout patterns using simple utility components.',
          },
          {
            title: 'TypeScript support',
            subtitle: 'Leverage the safety and utility provided by strictly typed props.',
            _type: 'link',
            href: '/docs/motivation#typescript-support',
            _key: 'd198c936d2b9',
          },
          {
            subtitle: 'Provides a breakproof system for implementing visual design.',
            _type: 'link',
            href: '/docs/motivation#enables-pixel-perfection',
            _key: '818dd328c298',
            title: 'Enables pixel-perfection',
          },
        ],
        copy: 'Sanity UI is an ergonomic toolkit to design with code.',
        _key: 'b585d481a560',
      },
    ],
    _type: 'screen',
    _id: '80ddcd8a-a89f-4163-8f8d-b941787da6e0',
    title: 'Home',
    _createdAt: '2020-11-23T10:37:34Z',
    content: null,
  },
  resultSourceMap: {
    documents: [
      {
        _id: '80ddcd8a-a89f-4163-8f8d-b941787da6e0',
        _type: 'screen',
      },
    ],
    paths: [
      "$['title']",
      "$['_createdAt']",
      "$['_rev']",
      "$['_type']",
      "$['_id']",
      "$['seo']",
      "$['_updatedAt']",
      "$['sections']",
    ],
    mappings: {
      "$['_createdAt']": {
        source: {
          document: 0,
          path: 1,
          type: 'documentValue',
        },
        type: 'value',
      },
      "$['_id']": {
        source: {
          document: 0,
          path: 4,
          type: 'documentValue',
        },
        type: 'value',
      },
      "$['_rev']": {
        source: {
          document: 0,
          path: 2,
          type: 'documentValue',
        },
        type: 'value',
      },
      "$['_type']": {
        source: {
          document: 0,
          path: 3,
          type: 'documentValue',
        },
        type: 'value',
      },
      "$['_updatedAt']": {
        source: {
          document: 0,
          path: 6,
          type: 'documentValue',
        },
        type: 'value',
      },
      "$['sections']": {
        source: {
          document: 0,
          path: 7,
          type: 'documentValue',
        },
        type: 'value',
      },
      "$['seo']": {
        source: {
          document: 0,
          path: 5,
          type: 'documentValue',
        },
        type: 'value',
      },
      "$['title']": {
        source: {
          document: 0,
          path: 0,
          type: 'documentValue',
        },
        type: 'value',
      },
    },
  },
}
