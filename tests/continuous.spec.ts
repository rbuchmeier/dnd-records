import { expect, test } from '@playwright/test'

const dialogue = [
  ['Fen', 'Ohhh, shiny rocks!'],
  ['Eli', 'Look, some abandoned Salamander nests!'],
  ['Tad', 'The sky is falling!'],
  ['Fen', 'Maybe there is a Basilisk around here!'],
  ['Tad', 'Man that is a lot of gold!'],
  ['Mom', 'I like that Jeweled Mace!'],
  ['Fen', 'How do these Oozes keep sneaking up on me?!?'],
  ['Fen', 'Ahh! Scary thing!'],
  ['Fen', 'Loot the bodies!'],
  ['Phillip', 'Hey guys! I think I found where they were sleeping!'],
  ['Eli', 'Why did they have so much money?'],
  [
    'Fen',
    'I wonder if they are working with the giants? I wonder if there is an underdark entrance down here?!?',
  ],
  [
    'Phillip',
    "Maybe, but I don't care right now. I hurt, and this bedroll smells really nice.",
  ],
  ['Fen', "I'll set up the jingle rope!"],
  ['Eli', "I'll set up the Tiny Hut."],
  ['Mom Tanks', "Let's try that boulder again!"],
  ['Fen', "Phillip, let's scout ahead."],
  ['Phillip · thinking', 'Does this tunnel seem bigger on the inside?'],
  ['Fen', 'Close the door!'],
  ['Mom Tanks', 'Did you say fireball?'],
  ['Fen', "We will come back after we've dealt with everything else."],
  ['Phillip', "Jalepeño, let's go check out over here!"],
  ['Phillip · shouting', 'Hey guys! Come check this out!'],
  ['Fen', 'Hmm, looks safe...'],
  ['Mom', 'Well that was quick.'],
  ['Fen', 'Ooohhh, shiny rocks!'],
  ['Phillip', 'Scout ahead Jalepeño!'],
  ['Jalepeño · shouting', 'Squawk!!'],
]

test('both sessions preserve all twenty-nine panels and the supplied script without demo content', async ({
  page,
}) => {
  const artRequests: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'image') artRequests.push(request.url())
  })
  await page.goto('/')
  const panels = page.locator('.comic-panel')
  await expect(panels).toHaveCount(29)
  await expect(page.locator('.panel-roll')).toHaveCount(2)
  for (const badge of await page.locator('.panel-roll').all()) {
    await expect(badge).toHaveCSS('width', '32px')
    await expect(badge).toHaveCSS('opacity', '0.75')
  }
  await expect(page.locator('[data-panel-id="A16"] .shout')).toContainText(
    'Phillip · shouting',
  )
  await expect(page.locator('[data-panel-id="A18"] .narration')).toHaveText(
    'An Ooze jumps out at Fen',
  )
  await expect(page.locator('[data-panel-id="A19"] .speech')).toHaveCount(2)
  await expect(page.locator('[data-panel-id="A20"] .speech')).toContainText(
    'Scout ahead Jalepeño!',
  )
  await expect(page.locator('[data-panel-id="A21"] .shout')).toContainText(
    'Squawk!!',
  )
  await expect(page.locator('[data-panel-id="A22"] .narration')).toHaveText(
    'Wolves, Invisibility, Fireball!',
  )
  await expect(
    page
      .locator('[data-panel-id="A4"]')
      .getByRole('img', { name: 'Critical hit: natural 20' }),
  ).toBeVisible()
  await expect(
    page.locator('[data-panel-id="A4"] .panel-roll text'),
  ).toHaveText('20')
  await expect(
    page
      .locator('[data-panel-id="A5"]')
      .getByRole('img', { name: 'Critical fail: natural 1' }),
  ).toBeVisible()
  await expect(
    page.locator('[data-panel-id="A5"] .panel-roll text'),
  ).toHaveText('1')
  await expect(page.locator('[data-reading-session]')).toHaveCount(2)
  expect(
    await panels.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-panel-id')),
    ),
  ).toEqual([
    ...Array.from({ length: 7 }, (_, i) => `A${i + 23}`),
    ...Array.from({ length: 22 }, (_, i) => `A${i + 1}`),
  ])
  await expect(page.locator('[data-panel-id="A23"] .narration')).toHaveText(
    '3 Fireballs and a dead Hairball later...',
  )
  await expect(page.locator('[data-panel-id="A26"] .speech')).toHaveCount(3)
  await expect(page.locator('[data-panel-id="A27"] .narration')).toHaveText(
    'Fen shoots the ceiling and is attacked from below',
  )
  await expect(page.locator('[data-panel-id="A10"] .thought')).toContainText(
    'Phillip · thinking',
  )
  await expect(page.locator('[data-panel-id="A11"] .sound-caption')).toHaveText(
    'Some gentle snoring can be heard.',
  )
  await expect(page.locator('[data-panel-id="A8"] .narration')).toHaveText(
    'Mom Tanks rolls the boulder away.',
  )
  await expect(page.locator('[data-panel-id="A13"] .narration')).toHaveText(
    "Fen steals Mom's wand, Mom pouts.",
  )
  await expect(page.locator('[data-panel-id="A14"] .narration')).toHaveText(
    'Mom gets his wand back after putting the boulder back.',
  )
  await expect(page.locator('.speech cite')).toHaveText(
    dialogue.map(([speaker]) => speaker),
  )
  await expect(page.locator('.speech p')).toHaveText(
    dialogue.map(([, text]) => `“${text}”`),
  )
  await expect(panels.nth(9).locator('.narration')).toHaveText('300 PP later')
  await expect(panels.nth(12).locator('.speech')).toHaveCount(2)
  await expect(panels.nth(13).locator('.narration')).toHaveText(
    'One Long Rest later...',
  )
  await expect(
    page.locator('.comic-panel img, .image-placeholder, [data-letter-id]'),
  ).toHaveCount(0)
  await expect(page.getByRole('main')).not.toContainText(
    /Hollow Crown|Elara|Rowan/,
  )
  expect(artRequests).toEqual([])
  await page.goto('/#/chronicle')
  await expect(panels).toHaveCount(29)
})

test('chronicle visibility persists and the empty view recovers', async ({
  page,
}) => {
  await page.goto('/')
  const chronicles = page.getByRole('checkbox', { name: 'Show chronicles' })
  const letters = page.getByRole('checkbox', { name: 'Show letters' })
  await chronicles.uncheck()
  await expect(page.getByText('No entries to show.')).toBeVisible()
  await letters.uncheck()
  await page.reload()
  await expect(chronicles).not.toBeChecked()
  await expect(letters).not.toBeChecked()
  await page.getByRole('button', { name: 'Show all' }).click()
  await expect(chronicles).toBeChecked()
  await expect(letters).toBeChecked()
  await expect(page.locator('.comic-panel')).toHaveCount(29)
})

test('chronology scrolls the story and returns to the session start', async ({
  page,
}) => {
  await page.goto('/')
  const rail = page.getByRole('complementary', { name: 'Session chronology' })
  const session = rail.getByRole('button', {
    name: 'Session: Oct 15, 2026',
  })
  await expect(session).toHaveAttribute('aria-current', 'step')
  const latestDate = page.locator('.reading-strip-date').first()
  await expect(latestDate).toHaveText('Oct 15, 2026')
  await expect(latestDate).toHaveAttribute('datetime', '2026-10-15')
  await expect(
    rail.getByRole('button', { name: 'Session: Oct 8, 2026' }),
  ).toBeVisible()
  await rail.hover()
  await page.mouse.wheel(0, 10000)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400)
  await session.click()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(100)
})

for (const width of [390, 900, 1440]) {
  test(`text-only panels contain their text without overlap at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const panels = page.locator('.comic-panel')
    await expect(panels).toHaveCount(29)
    for (const panel of await panels.all()) {
      const bounds = (await panel.boundingBox())!
      expect(bounds.height).toBeGreaterThanOrEqual(240)
      const badgeLocator = panel.locator('.panel-roll')
      const badge = (await badgeLocator.count())
        ? await badgeLocator.boundingBox()
        : null
      if (badge) {
        expect(badge.y - bounds.y).toBeGreaterThan(0)
        expect(badge.y - bounds.y).toBeLessThan(20)
        expect(bounds.x + bounds.width - badge.x - badge.width).toBeLessThan(20)
        expect(badge.x + badge.width).toBeLessThan(bounds.x + bounds.width)
      }
      let previousBottom = bounds.y
      for (const text of await panel
        .locator('.narration, .speech, .sound-caption')
        .all()) {
        const box = (await text.boundingBox())!
        expect(box.y).toBeGreaterThanOrEqual(previousBottom)
        if (badge) expect(box.y).toBeGreaterThanOrEqual(badge.y + badge.height)
        expect(box.x).toBeGreaterThanOrEqual(bounds.x)
        expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width)
        expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height)
        previousBottom = box.y + box.height
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: `.local/screenshots/session-stub-${width}.png`,
      fullPage: true,
    })
  })
}
