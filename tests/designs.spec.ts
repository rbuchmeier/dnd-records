import { test, expect } from '@playwright/test'

const designs = [
  { id: 'timeline', title: 'The Story Thread' },
  { id: 'wheel', title: 'The Chronicle Wheel' },
  { id: 'folio', title: 'The Session Folio' },
]

test('gallery links to three working design alternatives', async ({ page }) => {
  await page.goto('/#/designs')
  await expect(page.locator('.design-choice')).toHaveCount(3)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: '.local/screenshots/design-gallery.png',
    fullPage: true,
  })
  for (const design of designs) {
    await page.goto('/#/designs')
    await page.locator(`.choice-${design.id}`).click()
    await expect(
      page.getByRole('heading', { name: design.title, exact: true }),
    ).toBeVisible()
  }
})

for (const design of designs) {
  test(`${design.id}: newest session, filters, and entry links work`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`/#/designs/${design.id}`)
    await expect(page.locator('[data-session-id]').first()).toHaveAttribute(
      'data-session-id',
      'ses-003',
    )
    if (design.id !== 'wheel') {
      expect(
        await page
          .locator('[data-session-id]')
          .evaluateAll((nodes) =>
            nodes.map((node) => node.getAttribute('data-session-id')),
          ),
      ).toEqual(['ses-003', 'ses-002', 'ses-001'])
    }
    await expect(
      page.locator('[data-entry-id="entry-letter-after"]'),
    ).toBeVisible()
    await page
      .getByRole('checkbox', { name: 'Show Letters', exact: true })
      .click()
    await expect(page.locator('[data-account-id="acc-letters"]')).toHaveCount(0)
    await expect(page.locator('[data-entry-id="entry-below"]')).toBeVisible()
    await page.reload()
    await expect(
      page.getByRole('checkbox', { name: 'Show Letters', exact: true }),
    ).not.toBeChecked()
    await page
      .getByRole('button', { name: 'Chronicle only', exact: true })
      .click()
    await expect(
      page.locator('[data-account-id]:not([data-account-id="acc-chronicle"])'),
    ).toHaveCount(0)
    await page
      .getByRole('button', { name: 'Show all voices', exact: true })
      .click()
    await expect(
      page.locator('[data-entry-id="entry-letter-after"]'),
    ).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({
      path: `.local/screenshots/design-${design.id}.png`,
      fullPage: true,
    })
    await page.locator('[data-entry-id="entry-below"]').click()
    await expect(page.locator('.entry')).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: 'Beneath the old stones',
        exact: true,
      }),
    ).toBeVisible()
    expect(errors).toEqual([])
  })

  test(`${design.id}: phone layout stays within viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/#/designs/${design.id}`)
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await page
      .getByRole('checkbox', { name: 'Show Letters', exact: true })
      .click()
    await expect(page.locator('[data-account-id="acc-letters"]')).toHaveCount(0)
    await page.screenshot({
      path: `.local/screenshots/design-${design.id}-mobile.png`,
      fullPage: true,
    })
  })
}

test('filters follow the reader between alternatives', async ({ page }) => {
  await page.goto('/#/designs/timeline')
  await page
    .getByRole('checkbox', { name: 'Show Field notes', exact: true })
    .click()
  await expect(
    page.getByRole('checkbox', { name: 'Show Field notes', exact: true }),
  ).not.toBeChecked()
  await page
    .getByRole('navigation', { name: 'Design options' })
    .getByRole('link', { name: /Interactive astrolabe/ })
    .click()
  await expect(
    page.getByRole('checkbox', { name: 'Show Field notes', exact: true }),
  ).not.toBeChecked()
  await expect(page.locator('[data-account-id="acc-journal"]')).toHaveCount(0)
  await page
    .getByRole('navigation', { name: 'Design options' })
    .getByRole('link', { name: /An issue for every gathering/ })
    .click()
  await expect(
    page.getByRole('checkbox', { name: 'Show Field notes', exact: true }),
  ).not.toBeChecked()
})

test('wheel selection and folio back issues expose earlier sessions', async ({
  page,
}) => {
  await page.goto('/#/designs/wheel')
  await page.getByRole('button', { name: /^Session 1:/ }).click()
  await expect(page.locator('[data-session-id]')).toHaveAttribute(
    'data-session-id',
    'ses-001',
  )
  await expect(page.locator('[data-entry-id="entry-road"]')).toBeVisible()
  await page
    .getByRole('group', { name: 'All sessions, newest first' })
    .getByRole('button')
    .first()
    .click()
  await expect(page.locator('[data-session-id]')).toHaveAttribute(
    'data-session-id',
    'ses-003',
  )
  await page.goto('/#/designs/folio')
  const olderSession = page.locator('[data-session-id="ses-002"]')
  await expect(
    olderSession.locator('[data-entry-id="entry-bell"]'),
  ).not.toBeVisible()
  await olderSession.locator('summary').click()
  await expect(
    olderSession.locator('[data-entry-id="entry-bell"]'),
  ).toBeVisible()
  await olderSession
    .getByRole('link', { name: /The bell that answered/ })
    .click()
  await expect(page.locator('.entry')).toBeVisible()
})
