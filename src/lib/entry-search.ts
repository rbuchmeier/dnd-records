import type { Entry } from './content'

export function normalizeSearchText(text: string): string {
  return text.normalize('NFKC').toLowerCase().trim()
}

// Built from the eagerly loaded text, independently of artwork downloads.
export function entrySearchText(entry: Entry, author: string): string {
  return normalizeSearchText(
    [
      entry.title,
      entry.subtitle,
      entry.summary,
      entry.body,
      author,
      ...entry.panels.flatMap((panel) => [
        panel.alt,
        panel.narration ?? '',
        ...(panel.dialogue ?? []).map((line) => `${line.speaker} ${line.text}`),
      ]),
    ].join(' '),
  )
}

export function matchesSearch(text: string, query: string): boolean {
  return normalizeSearchText(query)
    .split(/\s+/)
    .every((term) => text.includes(term))
}
