import {at, set} from '@sanity/mutate'
import {get} from '@sanity/util/paths'
import {useDocuments} from '@sanity/visual-editing/react'
import {defineOverlayPlugin} from '@sanity/visual-editing/unstable_overlay-components'

type ExcitingTitlePluginOptions = {
  append?: string
  buttonText?: string
}

export const ExcitingTitlePlugin = defineOverlayPlugin<ExcitingTitlePluginOptions>(
  ({append = '!', buttonText = '🎉'}) => ({
    type: 'hud',
    name: 'exciting-title',
    title: 'Exciting Title 🎉',
    component: function ExcitingTitleComponent(props) {
      const {node} = props

      const {getDocument} = useDocuments()
      const doc = getDocument(node.id)

      const onChange = () => {
        doc.patch(async ({getSnapshot}) => {
          const snapshot = await getSnapshot()
          const currentValue = get<string>(snapshot, node.path)
          const newValue = `${currentValue}${append}`
          return [at(node.path, set(newValue))]
        })
      }

      return (
        <button className="rounded bg-blue-500 px-2 py-1 text-sm text-white" onClick={onChange}>
          {buttonText}
        </button>
      )
    },
    guard: (context) => {
      return context.type === 'string'
    },
  }),
)
