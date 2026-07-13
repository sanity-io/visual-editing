import {stegaClean, testVercelStegaRegex} from './stega'

function isTextField(
  element: Element | null,
): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
}

function getTextFieldSelection(element: HTMLInputElement | HTMLTextAreaElement): string | null {
  try {
    const {selectionStart, selectionEnd, value} = element
    if (selectionStart === null || selectionEnd === null || selectionStart === selectionEnd) {
      return null
    }
    return value.slice(selectionStart, selectionEnd)
  } catch {
    // Reading `selectionStart` throws for input types that don't support selection (e.g. `type="number"`) in some browsers
    return null
  }
}

function serializeRangesToHtml(selection: Selection): string {
  let html = ''
  for (let i = 0; i < selection.rangeCount; i++) {
    const container = document.createElement('div')
    container.appendChild(selection.getRangeAt(i).cloneContents())
    html += container.innerHTML
  }
  return html
}

/**
 * Handles a `copy` event by rewriting the clipboard payload without stega-encoded metadata.
 * If the copied content doesn't contain any stega characters the event is left untouched and
 * the default browser behavior applies.
 * @internal
 */
export function cleanStegaFromCopyEvent(event: ClipboardEvent): void {
  // Defer to userland `copy` handlers that have taken over the event
  if (event.defaultPrevented) return
  const {clipboardData} = event
  if (!clipboardData) return

  // Copying from an input or textarea uses the field's own selection, and only has a plain text flavor
  const activeElement = document.activeElement
  if (isTextField(activeElement)) {
    const text = getTextFieldSelection(activeElement)
    if (!text || !testVercelStegaRegex(text)) return
    event.preventDefault()
    clipboardData.setData('text/plain', stegaClean(text))
    return
  }

  const selection = document.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return

  const text = selection.toString()
  // The HTML flavor is serialized too, both to keep rich text pastes clean and because it can
  // contain stega payloads the plain text flavor doesn't (e.g. in `alt` attributes)
  const html = serializeRangesToHtml(selection)
  if (!testVercelStegaRegex(text) && !testVercelStegaRegex(html)) return

  event.preventDefault()
  clipboardData.setData('text/plain', stegaClean(text))
  if (html) {
    clipboardData.setData('text/html', stegaClean(html))
  }
}

/**
 * Strips stega-encoded metadata (invisible characters) from clipboard data when content is
 * copied from the page, so copied text can be pasted into other tools without the hidden
 * characters tagging along. Copies that don't contain stega are left untouched.
 * @returns A function that disables the behavior again
 * @internal
 */
export function enableStegaCleanOnCopy(): () => void {
  document.addEventListener('copy', cleanStegaFromCopyEvent)
  return () => {
    document.removeEventListener('copy', cleanStegaFromCopyEvent)
  }
}
