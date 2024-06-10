import {type SchemaType} from 'sanity'
import {describe, expect, test} from 'vitest'

import {convertSchemaType} from './extractSchema'

describe(convertSchemaType.name, () => {
  const inputOutput = [
    [
      {
        jsonType: 'string',
        name: 'string',
        title: 'Title',
      },
      {type: 'string'},
    ],
  ] satisfies Array<[schemaType: SchemaType, ReturnType<typeof convertSchemaType>]>

  test('works', () => {
    inputOutput.forEach(([input, output]) => {
      expect(convertSchemaType(input, () => false)).toEqual(output)
    })
  })
})
