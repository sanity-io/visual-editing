// Returns Promise.withResolvers or polyfill if unavailable
export function createPromiseWithResolvers<T = unknown>(): {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void
} {
  if (typeof Promise.withResolvers === 'function') {
    return Promise.withResolvers<T>()
  }

  let resolve!: (value: T | PromiseLike<T>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject!: (reason?: any) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {promise, resolve, reject}
}
