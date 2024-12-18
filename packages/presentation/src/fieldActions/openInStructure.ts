import {MasterDetailIcon} from '@sanity/icons'
import {useContext, useMemo} from 'react'
import {type DocumentFieldActionGroup, type DocumentFieldActionProps, type Tool} from 'sanity'
import {useRouter} from 'sanity/router'
import {
  defineDocumentFieldAction,
  isRecord,
  pathToString,
  useWorkspace,
  type DocumentFieldActionItem,
} from '../internals'
import {PresentationContext} from '../PresentationContext'

function useOpenInStructureAction(
  props: DocumentFieldActionProps,
): DocumentFieldActionItem | DocumentFieldActionGroup {
  const {documentId, documentType, path} = props

  const workspace = useWorkspace()
  const {navigateIntent} = useRouter()
  const presentation = useContext(PresentationContext)

  const defaultStructureTool = useMemo(
    () => findStructureTool(workspace.tools, documentId, documentType),
    [documentId, documentType, workspace.tools],
  )
  const handleAction = () => {
    navigateIntent('edit', {
      id: documentId,
      type: documentType,
      mode: 'structure',
      path: pathToString(path),
    })
  }

  return {
    type: 'action',
    hidden: !presentation || path.length > 0 || !defaultStructureTool,
    icon: defaultStructureTool?.icon || MasterDetailIcon,
    title: `Open in ${defaultStructureTool?.title || 'Structure'}`,
    onAction: handleAction,
    renderAsButton: true,
  }
}

export const openInStructure = defineDocumentFieldAction({
  name: 'presentation/openInStructure',
  useAction: useOpenInStructureAction,
})

function findStructureTool(
  tools: Tool[],
  documentId: string,
  documentType: string,
): Tool | undefined {
  const results = tools.map((t) => {
    const match = t.canHandleIntent?.(
      'edit',
      {
        id: documentId,
        type: documentType,
        mode: 'structure',
      },
      {},
    )

    return {tool: t, match}
  })

  const modeMatches = results.filter((t) => isRecord(t.match) && t.match['mode'])

  if (modeMatches.length > 0) {
    return modeMatches[0].tool
  }

  const matches = results.filter((t) => t.match)

  return matches[0]?.tool
}
