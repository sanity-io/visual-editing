import {defineSchema} from './defineSchema'
import {pageSchema} from './page'
import {productSchema} from './product'
import {projectSchema} from './project'
import {shoeSchema} from './shoe'
import {siteSettingsSchema} from './siteSettings'

/** @public */
export const schema = defineSchema([
  ...pageSchema.types,
  ...productSchema.types,
  ...shoeSchema.types,
  ...projectSchema.types,
  ...siteSettingsSchema.types,
])
