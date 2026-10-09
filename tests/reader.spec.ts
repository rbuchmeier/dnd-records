import { test, expect } from '@playwright/test'

test('comic artwork loads, dialogue has a transcript, and chapters navigate', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#/accounts/acc-chronicle')
  await expect(
    page.getByRole('heading', { name: 'Campaign Chronicle', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Where the road ends', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.comic-panel')).toHaveCount(3)
  await expect
    .poll(() =>
      page
        .locator('.comic-panel img')
        .evaluateAll((images) =>
          images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
        ),
    )
    .toBe(true)
  await page.getByRole('button', { name: 'Transcript', exact: true }).click()
  await expect(page.locator('.transcript-panel')).toHaveCount(3)
  await page.getByRole('button', { name: 'Panels', exact: true }).click()
  await page.getByRole('button', { name: 'Expand illustration 1' }).click()
  await expect(page.locator('.image-dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.image-dialog')).not.toBeVisible()
  await page
    .getByRole('link', { name: /NEXT CHAPTER.*The bell that answered/ })
    .click()
  await expect(
    page.getByRole('heading', { name: 'The bell that answered', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'The bell that answered', exact: true }),
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('table of contents and bookmarks work', async ({ page }) => {
  await page.goto('/#/accounts/acc-chronicle')
  await page
    .getByRole('button', { name: 'Bookmark this entry', exact: true })
    .click()
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Remove bookmark', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page
    .getByRole('button', { name: 'Chapter I of III', exact: true })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('link', { name: /Beneath the old stones/ })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Beneath the old stones', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('You’re caught up.')).toBeVisible()
})

test('secondary accounts and searchable prose are readable', async ({
  page,
}) => {
  await page.goto('/#/accounts/acc-letters')
  await expect(
    page.getByRole('heading', { name: 'Letters from the road', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.prose')).toBeVisible()
  await page.goto('/#/search?q=crown')
  await expect(page.locator('.search-result').first()).toBeVisible()
  await page.locator('.search-result').first().click()
  await expect(page.locator('.entry')).toBeVisible()
  await page.goto('/#/accounts/acc-journal')
  await expect(
    page.getByRole('heading', { name: 'Notes from the wild', exact: true }),
  ).toBeVisible()
  await page.goto('/#/accounts/acc-compendium')
  await expect(
    page.getByRole('heading', { name: 'The known world', exact: true }),
  ).toBeVisible()
  await page.goto('/#/accounts/missing')
  await expect(
    page.getByRole('heading', { name: 'This page hasn’t been written.' }),
  ).toBeVisible()
})

test('phone layout keeps panels readable and navigation accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/accounts/acc-chronicle')
  await expect(
    page.getByRole('heading', { name: 'Campaign Chronicle', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page
    .getByRole('button', { name: 'Open navigation', exact: true })
    .click()
  await page
    .getByRole('navigation', { name: 'Campaign accounts' })
    .getByRole('link', { name: /Letters from the road/ })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Letters from the road', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Close navigation', exact: true }),
  ).not.toBeVisible()
  await page.goto('/#/accounts/acc-chronicle')
  await page.locator('.comic-panel img').first().waitFor()
  await page.screenshot({
    path: '.local/screenshots/mobile.png',
    fullPage: true,
  })
})

test('capture desktop design', async ({ page }) => {
  await page.goto('/#/accounts/acc-chronicle')
  await page.evaluate(() => document.fonts.ready)
  await expect
    .poll(() =>
      page
        .locator('.comic-panel img')
        .evaluateAll((images) =>
          images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
        ),
    )
    .toBe(true)
  await page.screenshot({
    path: '.local/screenshots/desktop.png',
    fullPage: true,
  })
})
