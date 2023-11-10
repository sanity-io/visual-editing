import { defineSchema } from './defineSchema'
import { pageSchema } from './page'
import { productSchema } from './product'
import { projectSchema } from './project'
import { shoeSchema } from './shoe'
import { siteSettingsSchema } from './siteSettings'
import { debugUrlSecretsSchema } from './debugUrlSecrets'

/** @public */
export const schema = defineSchema([
  ...pageSchema.types,
  ...productSchema.types,
  ...shoeSchema.types,
  ...projectSchema.types,
  ...siteSettingsSchema.types,
  ...debugUrlSecretsSchema.types,
])
