export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
export function isArray(value: unknown): value is Array<unknown> {
  return value !== null && Array.isArray(value)
}
