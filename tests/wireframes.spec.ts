import { test, expect } from '@playwright/test'

test('wireframe gallery offers five labeled studies and phone previews', async ({
  page,
}) => {
  await page.goto('/#/wireframes')
  await expect(page.locator('.wf-card')).toHaveCount(5)
  await page.screenshot({
    path: '.local/screenshots/wireframe-gallery.png',
    fullPage: true,
  })
  for (let number = 1; number <= 5; number++) {
    await page.goto(`/#/wireframes/A${number}`)
    await expect(
      page.getByRole('heading', { name: new RegExp(`^A${number} —`) }),
    ).toBeVisible()
    const preview = page.frameLocator('.wf-full-preview')
    await expect(preview.locator('body')).toContainText(`A${number}`)
    await page.getByRole('button', { name: 'Phone', exact: true }).click()
    expect((await page.locator('.wf-full-preview').boundingBox())!.width).toBe(
      390,
    )
  }
})

for (let number = 1; number <= 5; number++) {
  test(`A${number} desktop and phone wireframes render without overflow`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const response = await page.goto(`/wireframes/a${number}.html`)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('body')).toContainText(`A${number}`)
    await page.screenshot({
      path: `.local/screenshots/wireframe-a${number}-desktop.png`,
      fullPage: true,
    })
    await page.setViewportSize({ width: 390, height: 844 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: `.local/screenshots/wireframe-a${number}-phone.png`,
      fullPage: true,
    })
    expect(errors).toEqual([])
  })
}
