import { accounts, getSessionEntries } from '../lib/content'
import type { Entry, Session } from '../lib/content'

export type SessionDesignProps = {
  sessions: Session[]
  enabledAccountIds: string[]
}

export function visibleEntries(
  session: Session,
  enabledAccountIds: string[],
): Entry[] {
  return getSessionEntries(session.id).filter(
    (entry) =>
      accounts.find((account) => account.id === entry.accountId)?.format ===
        'chronicle' || enabledAccountIds.includes(entry.accountId),
  )
}

export function entryHref(entry: Entry): string {
  return `/accounts/${entry.accountId}/${entry.id}`
}

export function formatSessionDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}
