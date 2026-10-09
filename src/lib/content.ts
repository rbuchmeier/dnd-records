import YAML from 'yaml'
import { z } from 'zod'

const dialogueSchema = z.object({
  speaker: z.string().min(1),
  text: z.string().min(1),
  position: z.enum(['left', 'right']),
})

const panelSchema = z.object({
  id: z.string().min(1),
  image: z.string().min(1),
  alt: z.string().min(1),
  layout: z.enum(['wide', 'half']),
  narration: z.string().optional(),
  dialogue: z.array(dialogueSchema).optional(),
  position: z.string().optional(),
})

const accountSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  format: z.enum(['chronicle', 'letters', 'journal', 'compendium']),
  author: z.string().min(1),
  description: z.string().min(1),
  icon: z.enum(['book', 'feather', 'compass', 'sparkles']),
})

const entrySchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  accountId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string(),
  order: z.number().int().positive(),
  dateLabel: z.string().min(1),
  readTime: z.string().min(1),
  summary: z.string().min(1),
  panels: z.array(panelSchema),
})

export type Panel = z.infer<typeof panelSchema>
export type Account = z.infer<typeof accountSchema>
export type Entry = z.infer<typeof entrySchema> & { body: string }

function parseMarkdown(
  source: string,
  path: string,
): { metadata: unknown; body: string } {
  const match = source.match(
    /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/,
  )
  if (!match) {
    throw new Error(`${path}: expected YAML front matter enclosed by --- lines`)
  }

  try {
    return {
      metadata: YAML.parse(match[1]) as unknown,
      body: source.slice(match[0].length).trim(),
    }
  } catch (error) {
    throw new Error(`${path}: invalid YAML front matter`, { cause: error })
  }
}

function loadAccounts(): Account[] {
  const sources = import.meta.glob('../../content/accounts/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  const loaded = Object.entries(sources).map(([path, source]) => {
    const { metadata } = parseMarkdown(source, path)
    return accountSchema.parse(metadata)
  })

  const formatOrder: Record<Account['format'], number> = {
    chronicle: 0,
    letters: 1,
    journal: 2,
    compendium: 3,
  }
  loaded.sort(
    (a, b) =>
      formatOrder[a.format] - formatOrder[b.format] ||
      a.title.localeCompare(b.title),
  )

  const ids = new Set<string>()
  for (const account of loaded) {
    if (ids.has(account.id))
      throw new Error(`Duplicate account ID: ${account.id}`)
    ids.add(account.id)
  }
  return loaded
}

function loadEntries(loadedAccounts: Account[]): Entry[] {
  const sources = import.meta.glob('../../content/entries/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  const loaded = Object.entries(sources).map(([path, source]) => {
    const { metadata, body } = parseMarkdown(source, path)
    return { ...entrySchema.parse(metadata), body }
  })

  const accountIds = new Set(loadedAccounts.map((account) => account.id))
  const entryIds = new Set<string>()
  const panelIds = new Set<string>()
  const positions = new Set<string>()

  for (const entry of loaded) {
    if (entryIds.has(entry.id))
      throw new Error(`Duplicate entry ID: ${entry.id}`)
    entryIds.add(entry.id)
    if (!accountIds.has(entry.accountId)) {
      throw new Error(`${entry.id}: unknown account ID ${entry.accountId}`)
    }
    const position = `${entry.accountId}:${entry.order}`
    if (positions.has(position))
      throw new Error(`Duplicate entry order: ${position}`)
    positions.add(position)
    for (const panel of entry.panels) {
      if (panelIds.has(panel.id))
        throw new Error(`Duplicate panel ID: ${panel.id}`)
      panelIds.add(panel.id)
    }
  }

  const accountOrder = new Map(
    loadedAccounts.map((account, index) => [account.id, index]),
  )
  return loaded.sort(
    (a, b) =>
      (accountOrder.get(a.accountId) ?? 0) -
        (accountOrder.get(b.accountId) ?? 0) || a.order - b.order,
  )
}

export const accounts: Account[] = loadAccounts()
export const entries: Entry[] = loadEntries(accounts)

export function getAccount(id: string): Account | undefined {
  return accounts.find((account) => account.id === id)
}

export function getEntry(id: string): Entry | undefined {
  return entries.find((entry) => entry.id === id)
}

export function getAccountEntries(id: string): Entry[] {
  return entries.filter((entry) => entry.accountId === id)
}

export function assetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${path.replace(/^\/+/, '')}`
}
