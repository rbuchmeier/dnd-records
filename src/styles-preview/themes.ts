import type { CSSProperties } from 'react'
import { lightThemes } from './light-themes'
import { darkThemes } from './dark-themes'
import { twilightThemes } from './twilight-theme'
import { forgeThemes } from './forge-themes'

export const themes = [
  ...lightThemes,
  ...darkThemes,
  ...twilightThemes,
  ...forgeThemes,
]

// Editorial choice: change here, never through reader controls or URL parameters.
export const ACTIVE_THEME_ID = 'b6'

export function themeProperties(id: string): CSSProperties | undefined {
  const theme = themes.find((item) => item.id === id)
  if (!theme) return undefined
  const properties = Object.fromEntries(
    Object.entries(theme.colors).map(([key, value]) => [
      `--theme-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
      value,
    ]),
  )
  const rgb = theme.colors.page
    .slice(1)
    .match(/../g)!
    .map((hex) => parseInt(hex, 16))
  properties['colorScheme'] =
    rgb.reduce((sum, value) => sum + value, 0) < 384 ? 'dark' : 'light'
  return properties as CSSProperties
}
