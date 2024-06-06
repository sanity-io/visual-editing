/** @alpha This API may change */
export interface InsertMenuOptions {
  /** @defaultValue `false` */
  filter?: boolean
  groups?: Array<{name: string; title?: string; of?: Array<string>}>
  /** defaultValue `true` */
  icons?: boolean
  /** @defaultValue `['list']` */
  views?: Array<'list' | 'grid'>
}
