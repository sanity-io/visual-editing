/**
 * Creates a Promise with externally accessible resolve and reject functions.
 *
 * @template T - The type of the value that the Promise will resolve to.
 * @returns An object containing:
 *   - promise: A Promise that can be resolved or rejected externally.
 *   - resolve: A function to resolve the Promise with a value of type T.
 *   - reject: A function to reject the Promise with an error.
 * @source: https://github.com/vercel/ai/blob/5417c327791cfac791fd76b36eea52693a5ecbb4/packages/ai/util/create-resolvable-promise.ts
 */
export function createResolvablePromise<T = any>(): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
} {
  let resolve: (value: T) => void
  let reject: (error: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  }
}
