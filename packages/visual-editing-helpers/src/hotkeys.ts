const IS_MAC =
  typeof window != 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)

const MODIFIERS: Record<string, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'> =
  {
    alt: 'altKey',
    ctrl: 'ctrlKey',
    mod: IS_MAC ? 'metaKey' : 'ctrlKey',
    shift: 'shiftKey',
  }

export function isHotkey(keys: string[], event: KeyboardEvent): boolean {
  return keys.every((key) => {
    if (MODIFIERS[key]) {
      return event[MODIFIERS[key]]
    }
    return event.key === key.toUpperCase()
  })
}

export function isModKeyEvent(event: KeyboardEvent): boolean {
  return event.key === (IS_MAC ? 'Meta' : 'Ctrl')
}
