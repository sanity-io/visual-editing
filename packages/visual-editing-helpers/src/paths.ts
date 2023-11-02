export { pathToUrlString } from './pathToUrlString'
export { urlStringToPath } from './urlStringToPath'
// @TODO previously used `import {pathToString} from 'sanity'` but it was too heavy to be bundled
// src: https://github.com/sanity-io/sanity/blob/c64d0e29eb9e47a2291baaac5ca90a9c3b781ff9/packages/sanity/src/core/field/paths/helpers.ts#L17-L45
// using `@sanity/util` instead based on: https://github.com/sanity-io/sanity/blob/c64d0e29eb9e47a2291baaac5ca90a9c3b781ff9/packages/sanity/src/core/templates/validate.ts#L1
export {
  toString as pathToString,
  fromString as stringToPath,
} from '@sanity/util/paths'
