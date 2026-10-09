import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  assetUrl,
  getAccount,
  getSessionEntries,
  sessions,
} from '../lib/content'
import type { Panel } from '../lib/content'
import { formatSessionDate } from '../designs/shared'
import { entrySearchText, matchesSearch } from '../lib/entry-search'
import './continuous.css'
import { ACTIVE_THEME_ID, themeProperties } from '../styles-preview/themes'
import '../styles-preview/reader-themes.css'

const LETTERS_KEY = 'hollow-crown-show-letters'
const CHRONICLES_KEY = 'campaign-show-chronicles'

const sessionContent = sessions.map((session) => ({
  session,
  items: getSessionEntries(session.id).map((entry) => {
    const account = getAccount(entry.accountId)
    return {
      entry,
      format: account?.format,
      text: entrySearchText(entry, account?.author ?? ''),
    }
  }),
}))

function storedVisibility(key: string): boolean {
  try {
    return localStorage.getItem(key) !== 'false'
  } catch {
    return true
  }
}

function StoryPanel({ panel }: { panel: Panel }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className={`comic-panel ${panel.layout}`}>
      {!failed ? (
        <img
          src={assetUrl(panel.image)}
          alt={panel.alt}
          style={{ objectPosition: panel.position || 'center' }}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="image-placeholder">
          <span>Illustration unavailable</span>
        </div>
      )}
      {panel.narration && (
        <figcaption className="narration">{panel.narration}</figcaption>
      )}
      <div className="dialogue-group">
        {panel.dialogue?.map((line, i) => (
          <blockquote className={`speech ${line.position}`} key={i}>
            <cite>{line.speaker}</cite>
            <p>“{line.text}”</p>
          </blockquote>
        ))}
      </div>
    </figure>
  )
}

export default function ContinuousChronicle() {
  const [showLetters, setShowLetters] = useState(() =>
    storedVisibility(LETTERS_KEY),
  )
  const [showChronicles, setShowChronicles] = useState(() =>
    storedVisibility(CHRONICLES_KEY),
  )
  const [query, setQuery] = useState('')
  const filterRef = useRef<HTMLInputElement>(null)
  const visibleSessions = useMemo(
    () =>
      sessionContent
        .map(({ session, items }) => ({
          session,
          chronicles: items
            .filter(
              (item) =>
                showChronicles &&
                item.format === 'chronicle' &&
                matchesSearch(item.text, query),
            )
            .map((item) => item.entry),
          letters: items
            .filter(
              (item) =>
                showLetters &&
                item.format === 'letters' &&
                matchesSearch(item.text, query),
            )
            .map((item) => item.entry),
        }))
        .filter(
          ({ chronicles, letters }) =>
            chronicles.length > 0 || letters.length > 0,
        ),
    [query, showChronicles, showLetters],
  )
  const resultCount = visibleSessions.reduce(
    (count, { chronicles, letters }) =>
      count + chronicles.length + letters.length,
    0,
  )
  const [activeId, setActiveId] = useState(sessions[0]?.id ?? '')
  const sidebarRef = useRef<HTMLElement>(null)
  const sessionListRef = useRef<HTMLElement>(null)
  const storyRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = 'Campaign Chronicle'
    try {
      localStorage.setItem(LETTERS_KEY, String(showLetters))
      localStorage.setItem(CHRONICLES_KEY, String(showChronicles))
    } catch {
      /* Reading works without browser storage. */
    }
  }, [showLetters, showChronicles])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [query])

  useEffect(() => {
    let frame = 0
    const update = () => {
      const sections = [
        ...document.querySelectorAll<HTMLElement>('[data-reading-session]'),
      ]
      const readingLine = window.innerWidth <= 760 ? 164 : 80
      let current = sections[0]
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= readingLine)
          current = section
      }
      setActiveId(current?.dataset.readingSession ?? '')
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const observer = new ResizeObserver(schedule)
    if (storyRef.current) observer.observe(storyRef.current)
    update()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [visibleSessions])

  useEffect(() => {
    // The rail is a controller for the story, not a second, disconnected scroll area.
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        window.innerWidth <= 760 ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return
      event.preventDefault()
      const unit =
        event.deltaMode === 1
          ? 24
          : event.deltaMode === 2
            ? window.innerHeight
            : 1
      window.scrollBy({ top: event.deltaY * unit, behavior: 'instant' })
    }
    sidebar.addEventListener('wheel', wheel, { passive: false })
    return () => sidebar.removeEventListener('wheel', wheel)
  }, [])

  useEffect(() => {
    const list = sessionListRef.current
    const button = list?.querySelector<HTMLElement>('[aria-current="step"]')
    if (!list || !button) return
    const item = button.getBoundingClientRect()
    const viewport = list.getBoundingClientRect()
    if (window.innerWidth > 760) {
      if (item.top < viewport.top || item.bottom > viewport.bottom)
        list.scrollTop += item.top - viewport.top - 20
    } else if (item.left < viewport.left || item.right > viewport.right) {
      list.scrollLeft += item.left - viewport.left - 12
    }
  }, [activeId])

  function jumpTo(id: string) {
    const section = document.getElementById(`reading-${id}`)
    section?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }

  return (
    <div
      className={`continuous-reader ${showLetters ? 'with-letters' : 'without-letters'}`}
      data-theme={ACTIVE_THEME_ID}
      style={themeProperties(ACTIVE_THEME_ID)}
    >
      <a
        className="skip-link"
        href="#continuous-story"
        onClick={(event) => {
          event.preventDefault()
          storyRef.current?.focus()
        }}
      >
        Skip to story
      </a>
      <aside
        className="reading-rail"
        ref={sidebarRef}
        aria-label="Session chronology"
      >
        <nav
          className="reading-session-list"
          ref={sessionListRef}
          aria-label="Story sessions"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return
            if (
              [
                'ArrowDown',
                'ArrowUp',
                'PageDown',
                'PageUp',
                'Home',
                'End',
              ].includes(event.key)
            ) {
              event.preventDefault()
              if (event.key === 'Home') window.scrollTo({ top: 0 })
              else if (event.key === 'End')
                window.scrollTo({ top: document.documentElement.scrollHeight })
              else
                window.scrollBy({
                  top:
                    (event.key.includes('Up') ? -1 : 1) *
                    (event.key.startsWith('Page')
                      ? window.innerHeight * 0.8
                      : 100),
                })
            }
          }}
        >
          {visibleSessions.map(({ session }) => (
            <button
              type="button"
              key={session.id}
              aria-label={`Session ${session.number}: ${formatSessionDate(session.playedOn)}`}
              aria-current={session.id === activeId ? 'step' : undefined}
              onClick={() => jumpTo(session.id)}
            >
              <span className="reading-session-dot">
                {String(session.number).padStart(2, '0')}
              </span>
              <span className="reading-session-label">
                <time dateTime={session.playedOn}>
                  {formatSessionDate(session.playedOn)}
                </time>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="reading-main">
        <nav className="reading-navigation" aria-label="Reader controls">
          <form
            className="reading-filter"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              ref={filterRef}
              data-reader-filter
              aria-label="Filter chronicle and letters"
              placeholder="Filter by word…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  setQuery('')
                }
              }}
            />
            {query && (
              <button
                className="reading-clear"
                type="button"
                aria-label="Clear filter"
                onClick={() => {
                  setQuery('')
                  filterRef.current?.focus()
                }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </form>
          <div className="reading-type-toggles">
            <label className="reading-type-toggle">
              <input
                type="checkbox"
                aria-label="Show chronicles"
                checked={showChronicles}
                onChange={(event) => setShowChronicles(event.target.checked)}
              />
              <span>Chronicles</span>
            </label>
            <label className="reading-type-toggle">
              <input
                type="checkbox"
                aria-label="Show letters"
                checked={showLetters}
                onChange={(event) => setShowLetters(event.target.checked)}
              />
              <span>Letters</span>
            </label>
          </div>
          <output
            className={
              query.trim() ? 'reading-filter-status' : 'reading-sr-only'
            }
            aria-live="polite"
          >
            {resultCount} {resultCount === 1 ? 'entry' : 'entries'}
          </output>
        </nav>
        <main
          id="continuous-story"
          className="reading-story"
          ref={storyRef}
          tabIndex={-1}
        >
          <h1 className="reading-sr-only">Campaign Chronicle</h1>
          {visibleSessions.length === 0 && (
            <div className="reading-empty">
              <p>
                {!showChronicles && !showLetters
                  ? 'Choose Chronicles or Letters to show the story.'
                  : query.trim()
                    ? 'No matching entries.'
                    : 'No entries to show.'}
              </p>
              {!showChronicles && !showLetters ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowChronicles(true)
                    setShowLetters(true)
                  }}
                >
                  Show all
                </button>
              ) : query.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    filterRef.current?.focus()
                  }}
                >
                  Clear filter
                </button>
              ) : null}
            </div>
          )}
          {visibleSessions.map(({ session, chronicles, letters }) => {
            return (
              <section
                className="reading-session"
                id={`reading-${session.id}`}
                data-reading-session={session.id}
                key={session.id}
                aria-label={`Session ${session.number}: ${formatSessionDate(session.playedOn)}`}
              >
                <time
                  className="reading-strip-date"
                  dateTime={session.playedOn}
                >
                  {formatSessionDate(session.playedOn)}
                </time>
                <div
                  className={`reading-spread ${showLetters && letters.length ? 'has-correspondence' : ''}`}
                >
                  {chronicles.length > 0 && (
                    <div className="reading-panels">
                      {chronicles.map((entry) => (
                        <article
                          className="reading-chapter"
                          key={entry.id}
                          data-reading-entry={entry.id}
                          aria-label={entry.title}
                        >
                          <div className="comic-grid">
                            {entry.panels.map((panel) => (
                              <StoryPanel key={panel.id} panel={panel} />
                            ))}
                          </div>
                          {entry.panels.length === 0 && (
                            <div className="reading-prose">
                              <ReactMarkdown>{entry.body}</ReactMarkdown>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                  {showLetters && letters.length > 0 && (
                    <aside
                      className="reading-correspondence"
                      aria-label={`Letters from session ${session.number}`}
                    >
                      {letters.map((entry) => (
                        <article
                          className="reading-letter"
                          data-letter-id={entry.id}
                          key={entry.id}
                          aria-label={`Letter by ${getAccount(entry.accountId)?.author}`}
                        >
                          <div className="reading-letter-body">
                            <ReactMarkdown>{entry.body}</ReactMarkdown>
                          </div>
                        </article>
                      ))}
                    </aside>
                  )}
                </div>
              </section>
            )
          })}
        </main>
      </div>
    </div>
  )
}
