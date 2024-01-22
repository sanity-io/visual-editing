// const { getDependenciesToBundle } = require('@remix-run/dev')

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  serverModuleFormat: 'cjs',
  serverDependenciesToBundle: [
    // ...getDependenciesToBundle('apps-common')
    /^apps-common.*/,
    /^@sanity\/core-loader.*/,
    /^@sanity\/react-loader.*/,
    /^@sanity\/channels.*/,
    /^@sanity\/visual-editing-helpers.*/,
    'nanostores',
    'nanoevents',
  ],
  tailwind: true,
  watchPaths: [
    '../common/src/**',
    '../../packages/core-loader/src/**',
    '../../packages/react-loader/src/**',
  ],
}
