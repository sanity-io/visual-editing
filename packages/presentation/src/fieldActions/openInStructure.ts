import { MasterDetailIcon } from '@sanity/icons'
import { useContext, useMemo } from 'react'
import {
  defineDocumentFieldAction,
  DocumentFieldActionItem,
  isRecord,
  pathToString,
  Tool,
  useWorkspace,
} from 'sanity'
import { useRouter } from 'sanity/router'

import { PresentationContext } from '../PresentationContext'

export const openInStructure = defineDocumentFieldAction({
  name: 'presentation/openInStructure',
  useAction({ documentId, documentType, path }) {
    const workspace = useWorkspace()
    const { navigateIntent } = useRouter()
    const presentation = useContext(PresentationContext)

    const defaultStructureTool = useMemo(
      () => findStructureTool(workspace.tools, documentId, documentType),
      [documentId, documentType, workspace.tools],
    )

    return {
      type: 'action',
      hidden: !presentation || path.length > 0 || !defaultStructureTool,
      icon: defaultStructureTool?.icon || MasterDetailIcon,
      title: `Open in ${defaultStructureTool?.title || 'Structure'}`,
      onAction() {
        navigateIntent('edit', {
          id: documentId,
          type: documentType,
          mode: 'structure',
          path: pathToString(path),
        })
      },
      renderAsButton: true,
    } satisfies DocumentFieldActionItem
  },
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

    return { tool: t, match }
  })

  const modeMatches = results.filter((t) => isRecord(t.match) && t.match.mode)

  if (modeMatches.length > 0) {
    return modeMatches[0].tool
  }

  const matches = results.filter((t) => t.match)

  return matches[0]?.tool
}
