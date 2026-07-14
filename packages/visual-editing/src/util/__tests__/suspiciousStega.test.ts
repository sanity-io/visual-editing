import {vercelStegaCombine} from '@vercel/stega'
import {afterEach, expect, test, vi, type Mock} from 'vitest'

import type {SuspiciousStegaReport} from '../../types'
import {observeSuspiciousStega} from '../suspiciousStega'

const editInfo = {origin: 'sanity.io', href: '/studio'}
const encode = (value: string) => vercelStegaCombine(value, editInfo, false)

let dispose: (() => void) | undefined

afterEach(() => {
  dispose?.()
  dispose = undefined
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

function getReports(callback: Mock): SuspiciousStegaReport[] {
  return callback.mock.calls.flatMap((call) => call[0] as SuspiciousStegaReport[])
}

async function waitForReports(callback: Mock): Promise<SuspiciousStegaReport[]> {
  await vi.waitFor(() => expect(callback).toHaveBeenCalled())
  return getReports(callback)
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 100))

test('the initial audit reports stega in unsafe places and skips expected places', async () => {
  const link = document.createElement('a')
  link.setAttribute('class', encode('btn'))
  link.setAttribute('href', `/products/${encode('slug')}`)
  link.textContent = encode('Buy now')
  document.body.appendChild(link)

  const img = document.createElement('img')
  img.setAttribute('alt', encode('A photo'))
  document.body.appendChild(img)

  const time = document.createElement('time')
  time.setAttribute('datetime', encode('2026-01-01'))
  document.body.appendChild(time)

  const textarea = document.createElement('textarea')
  textarea.textContent = encode('A message')
  document.body.appendChild(textarea)

  const script = document.createElement('script')
  script.setAttribute('type', 'application/ld+json')
  script.textContent = JSON.stringify({headline: encode('Headline')})
  document.body.appendChild(script)

  const title = document.createElement('title')
  title.textContent = encode('Page title')
  document.head.appendChild(title)

  const meta = document.createElement('meta')
  meta.setAttribute('content', encode('Description'))
  document.head.appendChild(meta)

  const callback = vi.fn()
  dispose = observeSuspiciousStega(callback)
  const reports = await waitForReports(callback)

  const classReport = reports.find((report) => report.attribute === 'class')
  expect(classReport).toMatchObject({
    kind: 'attribute',
    element: link,
    cleaned: 'btn',
  })
  expect(classReport?.sanity).toEqual(editInfo)

  expect(reports.find((report) => report.attribute === 'href')).toMatchObject({
    kind: 'attribute',
    element: link,
    cleaned: '/products/slug',
  })
  expect(reports.find((report) => report.element === title)).toMatchObject({kind: 'head'})
  expect(reports.find((report) => report.attribute === 'content')).toMatchObject({
    kind: 'head',
    element: meta,
  })
  expect(reports.find((report) => report.element === script)).toMatchObject({kind: 'script'})
  expect(reports.find((report) => report.element === textarea)).toMatchObject({
    kind: 'form-value',
    cleaned: 'A message',
  })

  // Expected stega placements are not reported
  expect(reports.find((report) => report.attribute === 'alt')).toBeUndefined()
  expect(reports.find((report) => report.attribute === 'datetime')).toBeUndefined()
  // Neither is stega in rendered text
  expect(reports.find((report) => report.cleaned === 'Buy now')).toBeUndefined()
})

test('reports stega in nodes added after the initial audit', async () => {
  const callback = vi.fn()
  dispose = observeSuspiciousStega(callback)
  await flush()
  callback.mockClear()

  const div = document.createElement('div')
  div.setAttribute('id', encode('section-1'))
  document.body.appendChild(div)

  const reports = await waitForReports(callback)
  expect(reports).toHaveLength(1)
  expect(reports[0]).toMatchObject({
    kind: 'attribute',
    element: div,
    attribute: 'id',
    cleaned: 'section-1',
  })
})

test('reports stega in changed attributes and text', async () => {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const style = document.createElement('style')
  style.textContent = '.a{color:red}'
  document.body.appendChild(style)

  const callback = vi.fn()
  dispose = observeSuspiciousStega(callback)
  await flush()
  callback.mockClear()

  div.setAttribute('data-key', encode('key-1'))
  style.firstChild!.textContent = `.${encode('a')}{color:red}`

  const reports = await waitForReports(callback)
  expect(reports.find((report) => report.attribute === 'data-key')).toMatchObject({
    kind: 'attribute',
    element: div,
    cleaned: 'key-1',
  })
  expect(reports.find((report) => report.element === style)).toMatchObject({
    kind: 'style',
    cleaned: '.a{color:red}',
  })
})

test('dedupes repeated findings', async () => {
  const first = document.createElement('div')
  first.setAttribute('class', encode('card'))
  document.body.appendChild(first)
  const second = document.createElement('div')
  second.setAttribute('class', encode('card'))
  document.body.appendChild(second)

  const callback = vi.fn()
  dispose = observeSuspiciousStega(callback)
  const reports = await waitForReports(callback)
  expect(reports.filter((report) => report.attribute === 'class')).toHaveLength(1)
  callback.mockClear()

  // Re-applying the same value doesn't produce a new report
  first.setAttribute('class', encode('card'))
  await flush()
  expect(getReports(callback).filter((report) => report.attribute === 'class')).toHaveLength(0)
})

test('ignores stega inside the visual editing overlay', async () => {
  const overlay = document.createElement('sanity-visual-editing')
  const label = document.createElement('span')
  label.setAttribute('data-preview', encode('Preview'))
  overlay.appendChild(label)
  document.body.appendChild(overlay)

  const callback = vi.fn()
  dispose = observeSuspiciousStega(callback)
  await flush()
  expect(getReports(callback)).toHaveLength(0)

  // Also when added after the initial audit
  const anotherLabel = document.createElement('span')
  anotherLabel.setAttribute('data-preview', encode('Another preview'))
  overlay.appendChild(anotherLabel)
  await flush()
  expect(getReports(callback)).toHaveLength(0)
})

test('stops reporting once disposed', async () => {
  const callback = vi.fn()
  const stop = observeSuspiciousStega(callback)
  await flush()
  callback.mockClear()
  stop()

  const div = document.createElement('div')
  div.setAttribute('id', encode('section-1'))
  document.body.appendChild(div)
  await flush()
  expect(callback).not.toHaveBeenCalled()
})
