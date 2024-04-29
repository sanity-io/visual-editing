import {usePresentationTool} from '../usePresentationTool'

export function useCurrentPresentationToolName(): string | undefined {
  try {
    return usePresentationTool().name
  } catch {
    return undefined
  }
}
