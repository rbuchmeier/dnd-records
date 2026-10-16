import YAML from 'yaml'
import { z } from 'zod'
import { resolveAssetUrl } from './assets'

const dialogueSchema = z.object({
  speaker: z.string().min(1),
  kind: z.enum(['speech', 'thought', 'shout']).default('speech'),
  text: z.string().min(1),
  position: z.enum(['left', 'right']),
})

const panelSchema = z
  .object({
    id: z.string().min(1),
    image: z.string().min(1).optional(),
    alt: z.string().min(1).optional(),
    layout: z.enum(['wide', 'half']),
    roll: z.enum(['crit', 'crit-fail']).optional(),
    narration: z.string().optional(),
    sound: z.string().min(1).optional(),
    dialogue: z.array(dialogueSchema).optional(),
    position: z.string().optional(),
  })
  .refine((panel) => !panel.image || !!panel.alt, {
    message: 'Illustrated panels require alt text',
    path: ['alt'],
  })

const accountSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  format: z.enum(['chronicle', 'letters']),
  author: z.string().min(1),
  description: z.string().min(1),
  icon: z.enum(['book', 'feather', 'compass', 'sparkles']),
})

const entrySchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  accountId: z.string().min(1),
  sessionId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string(),
  order: z.number().int().positive(),
  dateLabel: z.string().min(1).optional(),
  readTime: z.string().min(1).optional(),
  summary: z.string().min(1),
  panels: z.array(panelSchema),
})

export type Panel = z.infer<typeof panelSchema>
export type Account = z.infer<typeof accountSchema>
export type Entry = z.infer<typeof entrySchema> & { body: string }

const sessionSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^ses-/),
  number: z.number().int().positive().optional(),
  playedOn: z.iso.date().optional(),
  title: z.string().min(1),
  summary: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
})

export type Session = z.infer<typeof sessionSchema> & { body: string }

export function parseMarkdown(
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
  // Load every entry's text up front for local filtering. Image paths remain
  // strings here; rendering a lazy <img> controls when artwork is requested.
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
    if (!sessions.some((session) => session.id === entry.sessionId)) {
      throw new Error(`${entry.id}: unknown session ID ${entry.sessionId}`)
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

function loadSessions(): Session[] {
  const sources = import.meta.glob('../../content/sessions/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>
  const loaded = Object.entries(sources).map(([path, source]) => {
    const { metadata, body } = parseMarkdown(source, path)
    return { ...sessionSchema.parse(metadata), body }
  })
  const ids = new Set<string>()
  const numbers = new Set<number>()
  for (const session of loaded) {
    if (
      ids.has(session.id) ||
      (session.number !== undefined && numbers.has(session.number))
    ) {
      throw new Error(`Duplicate session ID or number: ${session.id}`)
    }
    ids.add(session.id)
    if (session.number !== undefined) numbers.add(session.number)
  }
  return loaded.sort(
    (a, b) =>
      (b.number ?? Number.MAX_SAFE_INTEGER) -
      (a.number ?? Number.MAX_SAFE_INTEGER),
  )
}

export const sessions: Session[] = loadSessions()
export const accounts: Account[] = loadAccounts()
export const entries: Entry[] = loadEntries(accounts)

export function getAccount(id: string): Account | undefined {
  return accounts.find((account) => account.id === id)
}

export function getSessionEntries(id: string): Entry[] {
  return entries.filter((entry) => entry.sessionId === id)
}

export function assetUrl(path: string): string {
  return resolveAssetUrl(
    path,
    import.meta.env.VITE_ASSET_BASE_URL,
    import.meta.env.BASE_URL,
  )
}
