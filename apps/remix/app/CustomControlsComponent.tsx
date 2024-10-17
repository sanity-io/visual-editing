import {at, set} from '@sanity/mutate'
import {useDocuments, type OverlayComponent} from '@sanity/visual-editing'

export const CustomControlsComponent: OverlayComponent = (props) => {
  const {PointerEvents, node} = props

  const {getDocument} = useDocuments()

  const onChange = () => {
    const doc = getDocument<{
      title: string
    }>(node.id)

    doc.patch(({snapshot}) => {
      const newValue = `${snapshot.title}!`
      return [at(node.path, set(newValue))]
    })
  }

  return (
    <PointerEvents>
      <button
        className="py- absolute right-0 rounded bg-blue-500 px-1 text-xs text-white"
        onClick={onChange}
      >
        More Exciting!
      </button>
    </PointerEvents>
  )
}
