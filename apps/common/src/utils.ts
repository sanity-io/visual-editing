// Common utils used in templates, demos and tests.
// The JS in here needs to be able to run server side, browser side, in any fw

export function formatCurrency(value: number): string {
  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(value)
}
