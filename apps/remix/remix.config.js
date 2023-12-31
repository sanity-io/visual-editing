// const { getDependenciesToBundle } = require('@remix-run/dev')

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  // When running locally in development mode, we use the built-in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === 'development' ? undefined : './server.ts',
  serverBuildPath: 'api/index.js',
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
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
