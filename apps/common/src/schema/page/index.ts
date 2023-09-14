import { defineSchema } from '../defineSchema'
import { sectionStyleType } from './objects/sectionStyle'
import { pageType } from './page'
import { pageSectionType } from './pageSectionType'

export const pageSchema = defineSchema([
  // objects
  sectionStyleType,

  // documents
  pageType,
  pageSectionType,
])
