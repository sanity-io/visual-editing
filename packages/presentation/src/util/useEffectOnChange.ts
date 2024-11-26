import {useCallback, useEffect, useRef, type DependencyList} from 'react'

/**
 * Similar to `useEffect`, but only execute the callback on value change.
 * @param value - The value to watch for changes.
 * @param callback - The callback to execute when the value changes.
 * @param dependencies - The callback dependencies.
 * @param initialValue - An optional initial value to compare against.
 * @param comparator - An optional comparator function for determining changes, useful if the value is non-primitive. Should return true if the callback should be executed.
 * @internal
 */
export function useEffectOnChange<T>(
  value: T,
  callback: (value: T, prevValue: T | undefined) => void | (() => void),
  dependencies: DependencyList,
  initialValue?: T,
  comparator?: (a: T, b?: T) => boolean | undefined,
): void {
  const previousValueRef = useRef<T | undefined>(initialValue)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _callback = useCallback(callback, dependencies)

  useEffect(() => {
    const prev = previousValueRef.current
    previousValueRef.current = value
    if (comparator ? comparator(value, prev) : value !== prev) {
      return _callback(value, prev)
    }
  }, [_callback, comparator, value])
}
