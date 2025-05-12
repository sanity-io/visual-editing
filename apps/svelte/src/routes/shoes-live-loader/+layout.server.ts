import type {LayoutServerLoad} from './$types'

export const load: LayoutServerLoad = ({locals: {sanity}}) => {
  const {previewEnabled, previewPerspective} = sanity
  return {previewEnabled, previewPerspective}
}
