import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  ACTIVE_THEME_ID,
  themes,
  themeProperties,
} from '../src/styles-preview/themes'

const rectSelectors = [
  '.reading-rail',
  '.reading-navigation',
  '.comic-panel',
  '.reading-letter',
]

type Rectangle = { x: number; y: number; width: number; height: number }

async function layout(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  return page.evaluate((selectors) => {
    const rectangles: Record<string, Rectangle[]> = {}
    for (const selector of selectors) {
      rectangles[selector] = Array.from(
        document.querySelectorAll(selector),
      ).map((element) => {
        const box = element.getBoundingClientRect()
        return {
          x: box.x + window.scrollX,
          y: box.y + window.scrollY,
          width: box.width,
          height: box.height,
        }
      })
    }
    return rectangles
  }, rectSelectors)
}

function expectSameLayout(
  actual: Record<string, Rectangle[]>,
  baseline: Record<string, Rectangle[]>,
) {
  for (const selector of rectSelectors) {
    expect(actual[selector].length, selector).toBe(baseline[selector].length)
    for (const [index, box] of actual[selector].entries()) {
      const original = baseline[selector][index]
      for (const side of ['x', 'y', 'width', 'height'] as const) {
        expect(
          Math.abs(box[side] - original[side]),
          `${selector}[${index}].${side}`,
        ).toBeLessThan(1)
      }
    }
  }
}

function contrast(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const channels = hex
      .slice(1)
      .match(/../g)!
      .map((channel) => parseInt(channel, 16) / 255)
      .map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      )
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

test('palette text colors retain at least 4.5:1 contrast', () => {
  const pairs = [
    ['ink', 'page'],
    ['ink', 'nav'],
    ['muted', 'page'],
    ['muted', 'nav'],
    ['railMuted', 'rail'],
    ['railMuted', 'railActive'],
    ['captionInk', 'caption'],
    ['speechInk', 'speech'],
    ['speaker', 'speech'],
    ['letterInk', 'letter'],
    ['inputInk', 'input'],
    ['inputPlaceholder', 'input'],
  ] as const
  expect(themes.map((theme) => theme.id)).toEqual([
    'b1',
    'b2',
    'b3',
    'b4',
    'b5',
    'b6',
    'b7',
    'b8',
  ])
  for (const theme of themes) {
    for (const [foreground, background] of pairs) {
      const ratio = contrast(theme.colors[foreground], theme.colors[background])
      expect(
        ratio,
        `${theme.label} ${foreground}/${background}: ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  }
})

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1100 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`${viewport.name} palettes preserve reader geometry and have no overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })
    await page.goto('/')
    const baseline = await layout(page)
    expect(baseline['.comic-panel']).toHaveLength(9)
    expect(baseline['.reading-letter']).toHaveLength(2)

    for (const theme of themes) {
      // Test-only token application keeps future source-selected themes covered
      // without exposing a runtime theme picker or URL override.
      await page.locator('.continuous-reader').evaluate(
        (reader, { id, properties }) => {
          reader.setAttribute('data-theme', id)
          for (const [key, value] of Object.entries(properties)) {
            ;(reader as HTMLElement).style.setProperty(
              key === 'colorScheme' ? 'color-scheme' : key,
              String(value),
            )
          }
        },
        { id: theme.id, properties: themeProperties(theme.id)! },
      )
      await expect(page.locator('.continuous-reader')).toHaveAttribute(
        'data-theme',
        theme.id,
      )
      expectSameLayout(await layout(page), baseline)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${theme.label} ${viewport.name} horizontal overflow`,
      ).toBe(true)
      await expect
        .poll(() =>
          page
            .locator('.comic-panel img')
            .first()
            .evaluate((image) => (image as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0)
      await page.screenshot({
        path: `.local/screenshots/style-${theme.id}${viewport.name === 'mobile' ? '-mobile' : ''}.png`,
      })
    }

    await page.reload()
    await expect(page.locator('.continuous-reader')).toHaveAttribute(
      'data-theme',
      ACTIVE_THEME_ID,
    )
    expectSameLayout(await layout(page), baseline)
  })
}

test('B6 is source-selected and cannot be changed through old theme URLs', async ({
  page,
}) => {
  expect(ACTIVE_THEME_ID).toBe('b6')
  for (const url of [
    '/',
    '/#/chronicle',
    '/#/chronicle?theme=b1',
    '/#/chronicle?theme=b0',
    '/#/styles?theme=b3',
  ]) {
    await page.goto(url)
    const reader = page.locator('.continuous-reader')
    await expect(reader).toHaveAttribute('data-theme', 'b6')
    await expect(reader).toHaveCSS('background-color', 'rgb(23, 20, 20)')
    await expect(
      page.getByRole('navigation', { name: 'Color palettes' }),
    ).toHaveCount(0)
    await expect(page.locator('.style-studio')).toHaveCount(0)
  }
  await expect(page).toHaveURL(/#\/chronicle$/)
  await page
    .getByRole('searchbox', { name: 'Filter chronicle and letters' })
    .fill('ribbon')
  await expect(page.locator('[data-letter-id]')).toHaveCount(1)
  await expect(page.locator('[data-reading-entry]')).toHaveCount(0)
  await page.getByRole('checkbox', { name: 'Show letters' }).uncheck()
  await expect(page.getByText('No matching entries.')).toBeVisible()
})
