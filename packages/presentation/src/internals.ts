/**
 * The purpose of this file is to gather all the internals we use from `sanity` in a single location.
 * It makes maintenance easier, and allows us to quickly report to the Studio DX teams which internals we use, and
 * what changes they can make without it becoming breaking.
 */

export {
  type CommentIntentGetter,
  CommentsIntentProvider,
  defineDocumentFieldAction,
  type DocumentFieldActionItem,
  type DocumentStore,
  getPublishedId,
  isRecord,
  pathToString,
  Preview,
  type PublishedId,
  useActiveWorkspace,
  useDocumentStore,
  useEditState,
  useUnique,
  useWorkspace,
} from 'sanity'
export {decodeJsonParams, encodeJsonParams} from 'sanity/router'
export {
  type BackLinkProps,
  DocumentListPane,
  DocumentPane,
  type DocumentPaneNode,
  PaneLayout,
  type PaneNode,
  PaneRouterContext,
  type PaneRouterContextValue,
  type ReferenceChildLinkProps,
  StructureToolProvider,
  useDocumentPane,
} from 'sanity/structure'

/**
 * Changed
 * DocumentListPane
 * New
 * DocumentSheetListPane
 * PaneContainer
 * Moved
 * DocumentListPaneHeader => PaneHeader
 *
 *
 * under the hood, this import changed:
 * import {DocumentListPane} from 'sanity/structure'
 * it used to resolve to:
 * import {DocumentListPane} from 'sanity/src/structure/panes/documentList/DocumentListPane.tsx'
 * but now it resolves to:
 * import {DocumentListPane} from 'sanity/src/structure/panes/documentList/PaneContainer.tsx'
 * ref: https://github.com/sanity-io/sanity/commit/b8f9987666c441d7ab307f004eece33344770a71#diff-90bd90c70a2b60fb25bddbe5b2663b20a5e081a01d19bbaecec9b10851c7fe02
 *
 *
 * old DocumentListPane used to rely on
 * useSource()
 * useStructureToolSetting()
 * and wrap
 * <SourceProvider name={sourceName || parentSourceName}>
 * <Pane
        currentMaxWidth={350}
        data-ui="DocumentListPane"
        id={paneKey}
        maxWidth={640}
        minWidth={320}
        selected={isSelected}
      >
 * https://github.com/sanity-io/sanity/commit/b8f9987666c441d7ab307f004eece33344770a71#diff-71a2d7c047c474382fa70a7d481f226708d6355b9cb7bc1f2c8a6adea372d051
 *
 * PaneContainer
 * SourceProvider,
 * useI18nText,
 * useSource,
 *  <SourceProvider name={sourceName || parentSourceName}>
 * <Pane
        data-ui="DocumentListPane"
        id={paneKey}
        minWidth={320}
        {...(isSheetListLayout ? {} : {currentMaxWidth: 350, maxWidth: 640})}
        selected={isSelected}
      >
      <PaneHeader
          index={index}
          initialValueTemplates={initialValueTemplates}
          menuItemGroups={menuItemGroups}
          menuItems={menuItemsWithSelectedState}
          setLayout={setLayout}
          setSortOrder={setSortOrder}
          title={title}
        />
 */
