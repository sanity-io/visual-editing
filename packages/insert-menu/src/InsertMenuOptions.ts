/** @alpha This API may change */
export interface InsertMenuOptions {
  /** @defaultValue `false` */
  filter?: boolean
  groups?: Array<{name: string; title?: string; of?: Array<string>}>
  /** defaultValue `true` */
  icons?: boolean
  /** @defaultValue `[{name: 'list'}]` */
  views?: Array<{name: 'list'} | {name: 'grid'; previewUrl: (schemaTypeName: string) => string}>
}
