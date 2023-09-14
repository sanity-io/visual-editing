import { defineSchema } from './defineSchema'
import { pageSchema } from './page'
import { productSchema } from './product'
import { projectSchema } from './project'
import { siteSettingsSchema } from './siteSettings'

/** @public */
export const schema = defineSchema([
  ...pageSchema.types,
  ...productSchema.types,
  ...projectSchema.types,
  ...siteSettingsSchema.types,
])
