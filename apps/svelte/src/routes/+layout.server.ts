import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals: { preview } }) => {
  return {
    preview,
  }
}
