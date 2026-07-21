import type {ClientPerspective, ContentSourceMapDocuments} from '@sanity/client'
import {useCallback, useEffect, useRef} from 'react'

import type {ElementState, VisualEditingNode} from '../types'
import {orderSanityNodesByPosition} from './orderSanityNodesByPosition'

/**
 * Hook for reporting in use documents to Presentation
 * @internal
 */
export function useReportDocuments(
  comlink: VisualEditingNode | undefined,
  elements: ElementState[],
  perspective: ClientPerspective,
  variant: string | undefined,
): void {
  const lastReported = useRef<
    | {
        orderedIds: string[]
        perspective: ClientPerspective
        variant: string | undefined
      }
    | undefined
  >(undefined)

  const reportDocuments = useCallback(
    (
      documents: ContentSourceMapDocuments,
      perspective: ClientPerspective,
      variant: string | undefined,
    ) => {
      comlink?.post('visual-editing/documents', {
        documents,
        perspective,
        variant,
      })
    },
    [comlink],
  )

  useEffect(() => {
    // Report only nodes of type `SanityNode`. Untransformed `SanityStegaNode`
    // nodes without an `id`, are not reported as they will not contain the
    // necessary document data. Nodes are sorted by visual position so the
    // reported order reflects appearance on the page.
    const orderedNodes = orderSanityNodesByPosition(elements)
    const orderedIds = orderedNodes.map((node) => node.id)

    // Report if:
    // - Documents not yet reported
    // - Document IDs changed or their visual order changed
    // - Perspective or variant changed
    const lastOrderedIds = lastReported.current?.orderedIds
    const orderChanged =
      !lastOrderedIds ||
      lastOrderedIds.length !== orderedIds.length ||
      orderedIds.some((id, index) => id !== lastOrderedIds[index])

    if (
      orderChanged ||
      perspective !== lastReported.current?.perspective ||
      variant !== lastReported.current?.variant
    ) {
      const documentsOnPage: ContentSourceMapDocuments = orderedNodes.map((node) => {
        const {id: _id, type, projectId: _projectId, dataset: _dataset} = node
        return _projectId && _dataset
          ? {_id, _type: type!, _projectId, _dataset}
          : {_id, _type: type!}
      })
      lastReported.current = {orderedIds, perspective, variant}
      reportDocuments(documentsOnPage, perspective, variant)
    }
  }, [elements, perspective, variant, reportDocuments])
}
