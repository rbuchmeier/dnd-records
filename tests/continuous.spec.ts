import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const sessionIds = ['ses-003', 'ses-002', 'ses-001']
const letterIds = ['entry-letter-after', 'entry-letter-before']

async function loadComicArtwork(page: Page) {
  for (const panel of await page.locator('.comic-panel').all()) {
    await panel.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        panel
          .locator('img')
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
}

test('the full chronicle and letters read continuously', async ({ page }) => {
  await page.goto('/')

  const sections = page.locator('[data-reading-session]')
  await expect(sections).toHaveCount(3)
  expect(
    await sections.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-reading-session')),
    ),
  ).toEqual(sessionIds)
  await expect(page.locator('.comic-panel')).toHaveCount(9)

  for (const id of letterIds) {
    await expect(page.locator(`article[data-letter-id="${id}"]`)).toBeVisible()
  }
  await expect(
    page.locator('[data-letter-id="entry-letter-after"]'),
  ).toContainText('The bell rang when I said my name')
  await expect(
    page.locator('[data-letter-id="entry-letter-before"]'),
  ).toContainText('Keep the blue ribbon for me')

  await page.goto('/#/chronicle')
  await expect(page.locator('[data-reading-session]')).toHaveCount(3)
  await expect(page.locator('.comic-panel')).toHaveCount(9)
})

test('chronicle and letter visibility persist after reload', async ({
  page,
}) => {
  await page.goto('/')
  const letters = page.getByRole('checkbox', { name: 'Show letters' })
  const chronicles = page.getByRole('checkbox', { name: 'Show chronicles' })
  await expect(letters).toBeChecked()
  await expect(chronicles).toBeChecked()
  await letters.uncheck()
  await expect(letters).not.toBeChecked()
  await expect(page.locator('[data-reading-entry]')).toHaveCount(3)
  for (const id of letterIds) {
    await expect(page.locator(`[data-letter-id="${id}"]`)).not.toBeVisible()
  }

  await chronicles.uncheck()
  await expect(chronicles).not.toBeChecked()
  await expect(page.locator('[data-reading-entry]')).toHaveCount(0)
  await expect(page.locator('[data-reading-session]')).toHaveCount(0)

  await page.reload()
  await expect(letters).not.toBeChecked()
  await expect(chronicles).not.toBeChecked()
  await expect(
    page.getByText('Choose Chronicles or Letters to show the story.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Show all' }).click()
  await expect(letters).toBeChecked()
  await expect(chronicles).toBeChecked()
  await expect(page.locator('[data-reading-entry]')).toHaveCount(3)
  for (const id of letterIds) {
    await expect(page.locator(`[data-letter-id="${id}"]`)).toBeVisible()
  }
})

test('chronology wheel scrolls the story and tracks the active session', async ({
  page,
}) => {
  await page.goto('/')
  const chronology = page.getByRole('complementary', {
    name: 'Session chronology',
  })
  const newest = chronology.getByRole('button', {
    name: 'Session 3: Oct 8, 2026',
  })
  const oldest = chronology.getByRole('button', {
    name: 'Session 1: Sep 24, 2026',
  })
  await expect(newest).toHaveAttribute('aria-current', 'step')

  await chronology.hover()
  await page.mouse.wheel(0, 10000)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)
  await expect(oldest).toHaveAttribute('aria-current', 'step')
  const bottomScroll = await page.evaluate(() => window.scrollY)

  await newest.click()
  await expect(newest).toHaveAttribute('aria-current', 'step')
  expect(new URL(page.url()).hash).toBe('')
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeLessThan(bottomScroll)

  await oldest.click()
  await expect(oldest).toHaveAttribute('aria-current', 'step')
  expect(new URL(page.url()).hash).toBe('')
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)
})

test('desktop letters follow their session comic panels', async ({ page }) => {
  await page.goto('/')
  const spreads = page.locator('.reading-spread.has-correspondence')
  await expect(spreads).toHaveCount(2)
  for (const spread of await spreads.all()) {
    const letter = spread.locator('.reading-correspondence')
    const letterBox = await letter.boundingBox()
    expect(letterBox).not.toBeNull()
    const lastPanelBox = await spread
      .locator('.comic-panel')
      .last()
      .boundingBox()
    expect(lastPanelBox).not.toBeNull()
    expect(letterBox!.y).toBeGreaterThanOrEqual(
      lastPanelBox!.y + lastPanelBox!.height - 1,
    )
  }
})

test('mobile letters follow panels without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const spreads = page.locator('.reading-spread.has-correspondence')
  await expect(spreads).toHaveCount(2)
  for (const spread of await spreads.all()) {
    const lastPanelBox = await spread
      .locator('.comic-panel')
      .last()
      .boundingBox()
    const letterBox = await spread
      .locator('.reading-correspondence')
      .boundingBox()
    expect(lastPanelBox).not.toBeNull()
    expect(letterBox).not.toBeNull()
    expect(letterBox!.y).toBeGreaterThanOrEqual(
      lastPanelBox!.y + lastPanelBox!.height - 1,
    )
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})

test('reading chrome is minimal and the story starts immediately', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Campaign Chronicle')
  await expect(
    page.locator(
      '.reading-brand, .reading-rail-intro, .reading-intro, .reading-toolbar, .reading-rail-foot, .reading-session-heading, .reading-end, .panel-number',
    ),
  ).toHaveCount(0)
  await expect(page.getByText('The Hollow Crown', { exact: true })).toHaveCount(
    0,
  )
  await expect(
    page.getByText('Beneath the old stones', { exact: true }),
  ).toHaveCount(0)
  await expect(page.getByText('PRIVATE CORRESPONDENCE')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /design studies/i })).toHaveCount(
    0,
  )
  const firstPanel = await page.locator('.comic-panel').first().boundingBox()
  expect(firstPanel!.y).toBeLessThan(170)
  const navigation = page.getByRole('navigation', { name: 'Reader controls' })
  await expect(navigation).toBeVisible()
  const navigationBox = await navigation.boundingBox()
  expect(navigationBox).not.toBeNull()
  expect(firstPanel!.y).toBeGreaterThanOrEqual(
    navigationBox!.y + navigationBox!.height - 1,
  )
  await expect(
    navigation.getByRole('searchbox', { name: 'Filter chronicle and letters' }),
  ).toBeVisible()
  await expect(
    page.getByRole('checkbox', { name: 'Show chronicles' }),
  ).toBeVisible()
  await expect(
    page.getByRole('checkbox', { name: 'Show letters' }),
  ).toBeVisible()
})

test('every comic image is lazy and decodes asynchronously', async ({
  page,
}) => {
  await page.goto('/')
  const images = page.locator('.comic-panel img')
  await expect(images).toHaveCount(9)
  for (const image of await images.all()) {
    await expect(image).toHaveAttribute('loading', 'lazy')
    await expect(image).toHaveAttribute('decoding', 'async')
  }
})

test('comic strips show their session dates', async ({ page }) => {
  await page.goto('/')
  const dates = page.locator('.reading-strip-date')
  await expect(dates).toHaveText(['Oct 8, 2026', 'Oct 1, 2026', 'Sep 24, 2026'])
  await expect(dates.first()).toHaveAttribute('datetime', '2026-10-08')
  await page.getByRole('checkbox', { name: 'Show letters' }).uncheck()
  await expect(dates).toHaveCount(3)
  await expect(dates.first()).toBeVisible()
})

test('tablet continuous reader has no horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 1000 })
  await page.goto('/')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})

test('desktop continuous reader screenshot', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await loadComicArtwork(page)
  await page.screenshot({
    path: '.local/screenshots/continuous-desktop-viewport.png',
  })
  await page.screenshot({
    path: '.local/screenshots/continuous-desktop.png',
    fullPage: true,
  })
})

test('mobile continuous reader has no horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.comic-panel')).toHaveCount(9)
  await loadComicArtwork(page)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: '.local/screenshots/continuous-mobile-viewport.png',
  })
  await page.screenshot({
    path: '.local/screenshots/continuous-mobile.png',
    fullPage: true,
  })
})
