export interface SanityImageValue {
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
}

export type SanityArrayValue<T> = { _key: string } & T
