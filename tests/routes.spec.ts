import { expect, test } from '@playwright/test'

for (const route of [
  '/asdf',
  '/designs',
  '/designs/wheel',
  '/wireframes/A1',
  '/styles',
  '/archive',
  '/search',
  '/accounts/acc-chronicle/entry-road',
  '/cast',
  '/cast/ent-eli',
  '/cast/ent-eli/extra',
]) {
  test(`${route} shows only a minimal 404 and can return to the story`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`/#${route}`)
    await expect(page).toHaveTitle('Page not found · Campaign Chronicle')
    await expect(page.getByRole('main')).toHaveText(
      'Page not foundReturn to the Chronicle',
    )
    await expect(page.locator('nav, aside, footer, img')).toHaveCount(0)
    await expect(page.getByRole('link')).toHaveCount(1)
    await page.keyboard.press('ControlOrMeta+K')
    await expect(page).toHaveURL(new RegExp(`#${route}$`))
    await page.getByRole('link', { name: 'Return to the Chronicle' }).click()
    await expect(page.locator('.comic-panel')).toHaveCount(22)
    await expect(page).toHaveTitle('Campaign Chronicle')
    expect(errors).toEqual([])
  })
}

test('the reader retains the shared palette', async ({ page }) => {
  for (const route of ['/#/chronicle?theme=b1']) {
    await page.goto(route)
    await expect(page.locator('body > #root > div')).toHaveCSS(
      'background-color',
      'rgb(23, 20, 20)',
    )
    await expect(page.locator('body > #root > div')).toHaveCSS(
      'color',
      'rgb(247, 237, 230)',
    )
  }
})
