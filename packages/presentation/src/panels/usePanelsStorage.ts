import { useMemo } from 'react'

import { debounce } from '../lib/debounce'
import { PanelElement } from './types'

const itemKey = 'presentation/panels'

type StoredPanelsState = Record<string, number[]>

const getStoredItem = () => {
  // @todo Validate
  return JSON.parse(localStorage.getItem(itemKey) || '{}') as StoredPanelsState
}
const setStoredItem = (data: StoredPanelsState) => {
  localStorage.setItem(itemKey, JSON.stringify(data))
}

const getKeyForPanels = (panels: PanelElement[]) => {
  return panels.map((panel) => [panel.id, panel.order].join(':')).join(',')
}

export function usePanelsStorage(): {
  get: (panels: PanelElement[]) => number[]
  set: (panels: PanelElement[], widths: number[]) => void
  setDebounced: (panels: PanelElement[], widths: number[]) => void
} {
  return useMemo(() => {
    const get = (panels: PanelElement[]) => {
      const stored = getStoredItem()
      const key = getKeyForPanels(panels)
      return stored[key]
    }

    const set = (panels: PanelElement[], widths: number[]) => {
      const stored = getStoredItem()
      const key = getKeyForPanels(panels)
      const data = {
        ...stored,
        [key]: widths,
      }
      setStoredItem(data)
    }

    const setDebounced = debounce(set, 100)
    return {
      get,
      set,
      setDebounced,
    }
  }, [])
}
