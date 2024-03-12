export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  timeout: number,
): F {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<F>) => {
    console.log('debounce', ...args)
    fn.apply(fn, args)
    // clearTimeout(timer)
    // timer = setTimeout(() => {
    //   fn.apply(fn, args)
    // }, timeout)
  }) as F
}
