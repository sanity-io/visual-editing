import {minLength, object, optional, pipe, string} from 'valibot'

const lengthyStr = pipe(string(), minLength(1))
const optionalLengthyStr = optional(lengthyStr)

export const sanityNodeSchema = object({
  baseUrl: lengthyStr,
  dataset: optionalLengthyStr,
  id: lengthyStr,
  path: lengthyStr,
  projectId: optionalLengthyStr,
  tool: optionalLengthyStr,
  type: optionalLengthyStr,
  workspace: optionalLengthyStr,
})
