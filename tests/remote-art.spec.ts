import { expect, test } from '@playwright/test'

// Opt-in live check. Regular test runs stay usable without cloud access.
const origin = process.env.EXPECTED_ASSET_BASE_URL?.replace(/\/+$/, '')

test('reader retrieves and displays every comic image from the configured R2 origin', async ({
  page,
}) => {
  test.skip(
    !origin,
    'Set EXPECTED_ASSET_BASE_URL to opt into live R2 verification',
  )
  const localArtRequests: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith('/art/') && url.origin !== origin) {
      localArtRequests.push(request.url())
    }
  })

  await page.goto('/#/chronicle')
  const images = page.locator('.comic-panel img')
  test.skip(
    (await images.count()) === 0,
    'This session has no panel artwork yet',
  )
  for (const image of await images.all()) {
    expect(
      (await image.getAttribute('src'))?.startsWith(`${origin}/art/`),
    ).toBe(true)
    await expect(image).toHaveAttribute('loading', 'lazy')
    await image.scrollIntoViewIfNeeded()
    await expect
      .poll(
        () =>
          image.evaluate(
            (element: HTMLImageElement) =>
              element.complete && element.naturalWidth > 0,
          ),
        { timeout: 15000 },
      )
      .toBe(true)
  }
  expect(localArtRequests).toEqual([])
})
