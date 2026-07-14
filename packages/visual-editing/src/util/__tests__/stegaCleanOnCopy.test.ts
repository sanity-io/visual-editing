import {vercelStegaCombine} from '@vercel/stega'
import {afterEach, describe, expect, test, vi} from 'vitest'

import {cleanStegaFromCopyEvent, enableStegaCleanOnCopy} from '../stegaCleanOnCopy'

const editInfo = {origin: 'sanity.io', href: '/studio'}
const encode = (value: string) => vercelStegaCombine(value, editInfo, false)

function createClipboardEvent(defaultPrevented = false) {
  const data = new Map<string, string>()
  const event = {
    defaultPrevented,
    preventDefault: vi.fn(),
    clipboardData: {
      setData: (type: string, value: string) => {
        data.set(type, value)
      },
    },
  }
  return {event: event as unknown as ClipboardEvent, preventDefault: event.preventDefault, data}
}

function stubSelection({text, html}: {text: string; html?: string}) {
  const fragment = document.createDocumentFragment()
  if (html !== undefined) {
    const template = document.createElement('template')
    template.innerHTML = html
    fragment.appendChild(template.content)
  } else {
    fragment.appendChild(document.createTextNode(text))
  }
  const selection = {
    isCollapsed: false,
    rangeCount: 1,
    toString: () => text,
    getRangeAt: () => ({cloneContents: () => fragment}),
  }
  return vi.spyOn(document, 'getSelection').mockReturnValue(selection as unknown as Selection)
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('cleanStegaFromCopyEvent', () => {
  test('strips stega from both clipboard flavors when the selection contains stega', () => {
    const encoded = encode('Hello world')
    stubSelection({text: encoded, html: `<p>${encoded}</p>`})
    const {event, preventDefault, data} = createClipboardEvent()

    cleanStegaFromCopyEvent(event)

    expect(preventDefault).toHaveBeenCalled()
    expect(data.get('text/plain')).toBe('Hello world')
    expect(data.get('text/html')).toBe('<p>Hello world</p>')
  })

  test('strips stega hidden in attributes of the HTML flavor', () => {
    const alt = encode('A nice photo')
    stubSelection({text: 'Some caption', html: `<img alt="${alt}"><span>Some caption</span>`})
    const {event, preventDefault, data} = createClipboardEvent()

    cleanStegaFromCopyEvent(event)

    expect(preventDefault).toHaveBeenCalled()
    expect(data.get('text/plain')).toBe('Some caption')
    expect(data.get('text/html')).toBe('<img alt="A nice photo"><span>Some caption</span>')
  })

  test('leaves the event untouched when the selection has no stega', () => {
    stubSelection({text: 'Plain text', html: '<p>Plain text</p>'})
    const {event, preventDefault, data} = createClipboardEvent()

    cleanStegaFromCopyEvent(event)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(data.size).toBe(0)
  })

  test('leaves the event untouched when default is already prevented', () => {
    stubSelection({text: encode('Hello world')})
    const {event, preventDefault, data} = createClipboardEvent(true)

    cleanStegaFromCopyEvent(event)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(data.size).toBe(0)
  })

  test('leaves the event untouched when the selection is collapsed', () => {
    vi.spyOn(document, 'getSelection').mockReturnValue({
      isCollapsed: true,
      rangeCount: 0,
    } as unknown as Selection)
    const {event, preventDefault, data} = createClipboardEvent()

    cleanStegaFromCopyEvent(event)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(data.size).toBe(0)
  })

  test('strips stega from text selected inside an input', () => {
    const encoded = encode('user@example.com')
    const input = document.createElement('input')
    input.value = encoded
    document.body.appendChild(input)
    input.focus()
    input.selectionStart = 0
    input.selectionEnd = encoded.length
    expect(document.activeElement).toBe(input)

    const {event, preventDefault, data} = createClipboardEvent()
    cleanStegaFromCopyEvent(event)

    expect(preventDefault).toHaveBeenCalled()
    expect(data.get('text/plain')).toBe('user@example.com')
    expect(data.has('text/html')).toBe(false)
  })

  test('leaves the event untouched when the input selection has no stega', () => {
    const input = document.createElement('input')
    input.value = 'user@example.com'
    document.body.appendChild(input)
    input.focus()
    input.selectionStart = 0
    input.selectionEnd = input.value.length

    const {event, preventDefault, data} = createClipboardEvent()
    cleanStegaFromCopyEvent(event)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(data.size).toBe(0)
  })
})

describe('enableStegaCleanOnCopy', () => {
  test('registers a copy listener and removes it on dispose', () => {
    const addEventListener = vi.spyOn(document, 'addEventListener')
    const removeEventListener = vi.spyOn(document, 'removeEventListener')

    const dispose = enableStegaCleanOnCopy()
    expect(addEventListener).toHaveBeenCalledWith('copy', cleanStegaFromCopyEvent)

    dispose()
    expect(removeEventListener).toHaveBeenCalledWith('copy', cleanStegaFromCopyEvent)
  })
})
