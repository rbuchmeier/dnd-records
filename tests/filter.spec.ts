import { expect, test } from '@playwright/test'

test('filter finds narration and speakers, and combines with visibility controls', async ({
  page,
}) => {
  await page.goto('/')
  const search = page.getByRole('searchbox', {
    name: 'Filter chronicle and letters',
  })
  for (const query of [
    '  300   PP  ',
    'phillip bedroll',
    'underdark giants',
    'Mom Tanks',
    'gentle snoring',
    'tunnel inside',
  ]) {
    await search.fill(query)
    await expect(page.locator('[data-reading-entry]')).toHaveCount(1)
    await expect(page.locator('.comic-panel')).toHaveCount(22)
  }
  await page.getByRole('checkbox', { name: 'Show chronicles' }).uncheck()
  await expect(page.getByText('No matching entries.')).toBeVisible()
  await expect(page.locator('[data-reading-session]')).toHaveCount(0)
  await page.getByRole('checkbox', { name: 'Show chronicles' }).check()
  await expect(page.locator('.comic-panel')).toHaveCount(22)
  await search.fill('jeweled mace')
  await expect(page.locator('[data-reading-entry]')).toHaveCount(1)
  await expect(page.locator('.comic-panel')).toHaveCount(7)
})

test('missing results clear with the button or Escape', async ({ page }) => {
  await page.goto('/')
  const controls = page.getByRole('navigation', { name: 'Reader controls' })
  const search = controls.getByRole('searchbox')
  await search.fill('hollow crown')
  await expect(page.getByText('No matching entries.')).toBeVisible()
  await expect(
    page
      .getByRole('navigation', { name: 'Story sessions' })
      .getByRole('button'),
  ).toHaveCount(0)
  await controls.getByRole('button', { name: 'Clear filter' }).click()
  await expect(search).toHaveValue('')
  await expect(page.locator('.comic-panel')).toHaveCount(29)
  await search.fill('unknown phrase')
  await search.press('Escape')
  await expect(search).toHaveValue('')
  await expect(page.locator('.comic-panel')).toHaveCount(29)
})

test('the search shortcut focuses the reader filter', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('ControlOrMeta+K')
  await expect(page.getByRole('searchbox')).toBeFocused()
})
