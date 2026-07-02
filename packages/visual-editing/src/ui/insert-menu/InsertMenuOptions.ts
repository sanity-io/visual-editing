/** @alpha This API may change */
export interface InsertMenuOptions {
  /**
   * @defaultValue `'auto'`
   * `filter: 'auto'` automatically turns on filtering if there are more than 5
   * schema types added to the menu.
   */
  filter?: 'auto' | boolean | undefined
  groups?: Array<{name: string; title?: string; of?: Array<string>}> | undefined
  /** defaultValue `true` */
  showIcons?: boolean | undefined
  /** @defaultValue `[{name: 'list'}]` */
  views?:
    | Array<
        | {name: 'list'}
        | {name: 'grid'; previewImageUrl?: (schemaTypeName: string) => string | undefined}
      >
    | undefined
}
