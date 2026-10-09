import { expect, test } from '@playwright/test'
import { resolveAssetUrl } from '../src/lib/assets'

test('artwork defaults to local files and preserves the app base path', () => {
  expect(resolveAssetUrl('art/arrival.webp', undefined, '/')).toBe(
    '/art/arrival.webp',
  )
  expect(resolveAssetUrl('/art/arrival.webp', '', '/chronicle/')).toBe(
    '/chronicle/art/arrival.webp',
  )
  expect(resolveAssetUrl('art/arrival.webp', '  ', '/chronicle/')).toBe(
    '/chronicle/art/arrival.webp',
  )
})

test('configured artwork origin replaces the app base and retains key prefixes', () => {
  expect(
    resolveAssetUrl(
      'art/arrival.webp',
      'https://assets.example.test',
      '/chronicle/',
    ),
  ).toBe('https://assets.example.test/art/arrival.webp')
  expect(
    resolveAssetUrl(
      '/art/arrival.webp',
      ' https://assets.example.test/demo/// ',
      '/chronicle/',
    ),
  ).toBe('https://assets.example.test/demo/art/arrival.webp')
})

test('explicit artwork URLs retain their own origin', () => {
  for (const url of [
    'https://other.example.test/art/arrival.webp',
    'http://localhost:9000/art/arrival.webp',
  ]) {
    expect(resolveAssetUrl(url, 'https://assets.example.test', '/')).toBe(url)
  }
})
