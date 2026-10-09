import { expect, test } from '@playwright/test'

test('search filters each letter and chronicle entry independently', async ({
  page,
}) => {
  await page.goto('/')
  const controls = page.getByRole('navigation', { name: 'Reader controls' })
  const search = controls.getByRole('searchbox', {
    name: 'Filter chronicle and letters',
  })

  await search.fill('  BLUE    RIBBON  ')
  await expect(page.locator('[data-reading-entry]')).toHaveCount(0)
  await expect(page.locator('[data-letter-id]')).toHaveCount(1)
  await expect(page.locator('[data-letter-id]')).toHaveAttribute(
    'data-letter-id',
    'entry-letter-before',
  )
  await expect(page.locator('[data-reading-session]')).toHaveCount(1)
  await expect(page.locator('[data-reading-session]')).toHaveAttribute(
    'data-reading-session',
    'ses-001',
  )

  await search.fill('thirteenth mile')
  await expect(page.locator('[data-reading-entry]')).toHaveAttribute(
    'data-reading-entry',
    'entry-road',
  )
  await expect(page.locator('[data-letter-id]')).toHaveAttribute(
    'data-letter-id',
    'entry-letter-before',
  )
  await expect(page.locator('[data-reading-session]')).toHaveCount(1)

  await search.fill('seal, not a door')
  await expect(page.locator('[data-reading-entry]')).toHaveCount(1)
  await expect(page.locator('[data-reading-entry]')).toHaveAttribute(
    'data-reading-entry',
    'entry-below',
  )
  await expect(page.locator('[data-letter-id]')).toHaveCount(0)
  await expect(page.locator('[data-reading-session]')).toHaveAttribute(
    'data-reading-session',
    'ses-003',
  )

  // This is in metadata, so it remains searchable even when the prose is not shown.
  await search.fill('promise throne')
  await expect(page.locator('[data-reading-entry]')).toHaveCount(1)
  await expect(page.locator('[data-reading-entry]')).toHaveAttribute(
    'data-reading-entry',
    'entry-below',
  )
  await expect(page.locator('[data-letter-id]')).toHaveCount(0)
})

test('type toggles combine with search and the chronology follows results', async ({
  page,
}) => {
  await page.goto('/')
  const controls = page.getByRole('navigation', { name: 'Reader controls' })
  const search = controls.getByRole('searchbox', {
    name: 'Filter chronicle and letters',
  })
  const chronicles = controls.getByRole('checkbox', { name: 'Show chronicles' })
  const letters = controls.getByRole('checkbox', { name: 'Show letters' })
  const chronology = page.getByRole('complementary', {
    name: 'Session chronology',
  })

  await search.fill('ribbon')
  await expect(chronology.getByRole('button')).toHaveCount(1)
  await expect(chronology.getByRole('button')).toHaveAttribute(
    'aria-current',
    'step',
  )
  await expect(chronology.getByRole('button')).toHaveAccessibleName(
    'Session 1: Sep 24, 2026',
  )

  await letters.uncheck()
  await expect(page.locator('[data-reading-session]')).toHaveCount(0)
  await expect(chronology.getByRole('button')).toHaveCount(0)
  await expect(page.getByText('No matching entries.')).toBeVisible()

  await search.fill('seal, not a door')
  await expect(page.locator('[data-reading-entry]')).toHaveCount(1)
  await expect(page.locator('[data-letter-id]')).toHaveCount(0)
  await expect(chronology.getByRole('button')).toHaveAccessibleName(
    'Session 3: Oct 8, 2026',
  )

  await chronicles.uncheck()
  await expect(
    page.getByText('Choose Chronicles or Letters to show the story.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Show all' }).click()
  await expect(chronicles).toBeChecked()
  await expect(letters).toBeChecked()
  await expect(page.locator('[data-reading-entry]')).toHaveCount(1)
  await expect(page.locator('[data-letter-id]')).toHaveCount(0)
})

test('missing results can be cleared from the controls', async ({ page }) => {
  await page.goto('/')
  const controls = page.getByRole('navigation', { name: 'Reader controls' })
  const search = controls.getByRole('searchbox', {
    name: 'Filter chronicle and letters',
  })
  await search.fill('no chronicle could contain this phrase')
  await expect(page.getByText('No matching entries.')).toBeVisible()
  await expect(page.locator('[data-reading-session]')).toHaveCount(0)
  await expect(
    page
      .getByRole('complementary', { name: 'Session chronology' })
      .getByRole('button'),
  ).toHaveCount(0)
  await controls.getByRole('button', { name: 'Clear filter' }).click()
  await expect(search).toHaveValue('')
  await expect(page.locator('[data-reading-entry]')).toHaveCount(3)
  await expect(page.locator('[data-letter-id]')).toHaveCount(2)
  await expect(page.locator('[data-reading-session]')).toHaveCount(3)
  await expect(
    controls.getByRole('button', { name: 'Clear filter' }),
  ).toHaveCount(0)
})

test('searchable text is ready even when artwork cannot load', async ({
  page,
}) => {
  await page.route('**/art/*.webp', (route) => route.abort())
  await page.goto('/')
  const search = page.getByRole('searchbox', {
    name: 'Filter chronicle and letters',
  })
  await search.fill('seal, not a door')
  await expect(page.locator('[data-reading-entry]')).toHaveCount(1)
  await expect(page.locator('[data-reading-entry]')).toHaveAttribute(
    'data-reading-entry',
    'entry-below',
  )
  await search.fill('ribbon')
  await expect(page.locator('[data-letter-id]')).toHaveAttribute(
    'data-letter-id',
    'entry-letter-before',
  )
})

test('the search shortcut focuses the reader filter', async ({ page }) => {
  await page.goto('/')
  const search = page.getByRole('searchbox', {
    name: 'Filter chronicle and letters',
  })
  await page.keyboard.press('ControlOrMeta+K')
  await expect(search).toBeFocused()
  expect(new URL(page.url()).pathname).toBe('/')
})
