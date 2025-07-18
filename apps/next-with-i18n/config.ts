const config = {
  sanity: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
    // Not exposed to the front-end, used solely by the server
    token: process.env.SANITY_API_TOKEN || '',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-06-21',
    revalidateSecret: process.env.SANITY_REVALIDATE_SECRET || '',
    studioUrl: '/studio',
  },
  siteName: 'With i18n',
  siteDomain: process.env.NEXT_PUBLIC_SITE_DOMAIN || '',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
  i18n: {
    locales: [
      {id: 'en', title: 'English'},
      {id: 'fr', title: 'French'},
    ],
    defaultLocaleId: 'en',
  },
}

export default config
