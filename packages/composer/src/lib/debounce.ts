export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  timeout: number,
): F {
  let timer: any
  return ((...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(fn, args)
    }, timeout)
  }) as F
}
