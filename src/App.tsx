import { useEffect, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Compass,
  Crown,
  Feather,
  Grid2X2,
  Library,
  List,
  Maximize2,
  Menu,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  accounts,
  entries,
  getAccount,
  getAccountEntries,
  getEntry,
  assetUrl,
} from './lib/content'
import type { Account, Entry, Panel } from './lib/content'

const icons = {
  book: BookOpen,
  feather: Feather,
  compass: Compass,
  sparkles: Sparkles,
}
const formatNames = {
  chronicle: 'Illustrated chronicle',
  letters: 'Letters & correspondence',
  journal: 'Field journal',
  compendium: 'Compendium',
}
const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

function entryPath(entry: Entry) {
  return `/accounts/${entry.accountId}/${entry.id}`
}

function Sidebar({ onClose }: { onClose: () => void }) {
  return (
    <aside className="sidebar">
      <Link
        to="/"
        className="brand"
        onClick={onClose}
        aria-label="The Hollow Crown home"
      >
        <span className="crest">
          <Crown size={31} strokeWidth={1.2} />
        </span>
        <span className="brand-title">The Hollow Crown</span>
        <span className="brand-subtitle">A CAMPAIGN ARCHIVE</span>
      </Link>
      <div className="sidebar-rule">
        <span>✦</span>
      </div>
      <nav aria-label="Campaign accounts">
        <p className="nav-label">THE STORY</p>
        {accounts
          .filter((a) => a.format === 'chronicle')
          .map((account) => (
            <AccountLink key={account.id} account={account} onClose={onClose} />
          ))}
        <p className="nav-label accounts-label">OTHER PERSPECTIVES</p>
        {accounts
          .filter((a) => a.format !== 'chronicle')
          .map((account) => (
            <AccountLink key={account.id} account={account} onClose={onClose} />
          ))}
        <div className="sidebar-divider" />
        <NavLink
          to="/archive"
          className="nav-link archive-link"
          onClick={onClose}
        >
          <Library size={18} />
          <span>The complete archive</span>
        </NavLink>
      </nav>
      <div className="sidebar-foot">
        <span className="small-star">✧</span>
        <p>
          Many voices.
          <br />
          One unfolding story.
        </p>
        <div className="demo-label">
          <span /> FICTIONAL DEMO CAMPAIGN
        </div>
      </div>
    </aside>
  )
}

function AccountLink({
  account,
  onClose,
}: {
  account: Account
  onClose: () => void
}) {
  const Icon = icons[account.icon]
  const location = useLocation()
  const active =
    location.pathname.includes(`/accounts/${account.id}`) ||
    (account.format === 'chronicle' && location.pathname === '/')
  return (
    <Link
      className={`nav-link ${active ? 'active' : ''}`}
      to={`/accounts/${account.id}`}
      onClick={onClose}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={19} strokeWidth={1.5} />
      <span>
        <span className="nav-title">{account.title}</span>
        <small>
          {account.format === 'chronicle'
            ? 'The shared adventure'
            : account.author}
        </small>
      </span>
      {active && <span className="active-mark">◆</span>}
    </Link>
  )
}

function AccountCards() {
  return (
    <section className="other-accounts" aria-labelledby="accounts-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">BEYOND THE CHRONICLE</p>
          <h2 id="accounts-title">Every adventurer has a story.</h2>
        </div>
        <Feather size={26} strokeWidth={1} />
      </div>
      <div className="account-card-grid">
        {accounts
          .filter((a) => a.format !== 'chronicle')
          .map((account) => {
            const Icon = icons[account.icon]
            return (
              <Link
                className="account-card"
                key={account.id}
                to={`/accounts/${account.id}`}
              >
                <Icon size={24} strokeWidth={1.2} />
                <small>{formatNames[account.format]}</small>
                <h3>{account.title}</h3>
                <p>{account.author}</p>
                <ArrowRight className="card-arrow" size={17} />
              </Link>
            )
          })}
      </div>
    </section>
  )
}

function useBookmark(id: string) {
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem('chronicle-bookmarks') || '[]',
      )
      return Array.isArray(value)
        ? value.filter((x): x is string => typeof x === 'string')
        : []
    } catch {
      return []
    }
  })
  return [
    saved.includes(id),
    () =>
      setSaved((previous) => {
        const next = previous.includes(id)
          ? previous.filter((key) => key !== id)
          : [...previous, id]
        try {
          localStorage.setItem('chronicle-bookmarks', JSON.stringify(next))
        } catch {
          /* The reading experience also works without storage. */
        }
        return next
      }),
  ] as const
}

function ComicPanel({
  panel,
  index,
  onExpand,
}: {
  panel: Panel
  index: number
  onExpand: (panel: Panel) => void
}) {
  const [failed, setFailed] = useState(false)
  return (
    <figure
      className={`comic-panel ${panel.layout} ${failed ? 'image-unavailable' : ''}`}
    >
      {!failed && (
        <img
          src={assetUrl(panel.image)}
          alt={panel.alt}
          style={{ objectPosition: panel.position || 'center' }}
          loading={index === 0 ? 'eager' : 'lazy'}
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="image-placeholder">
          <Crown size={42} strokeWidth={1} />
          <span>Illustration unavailable</span>
        </div>
      )}
      <span className="panel-number">{String(index + 1).padStart(2, '0')}</span>
      {panel.narration && (
        <figcaption className="narration">{panel.narration}</figcaption>
      )}
      <div className="dialogue-group">
        {panel.dialogue?.map((line, i) => (
          <blockquote key={i} className={`speech ${line.position}`}>
            <cite>{line.speaker}</cite>
            <p>“{line.text}”</p>
          </blockquote>
        ))}
      </div>
      {!failed && (
        <button
          className="expand-panel"
          onClick={() => onExpand(panel)}
          aria-label={`Expand illustration ${index + 1}`}
        >
          <Maximize2 size={16} />
        </button>
      )}
    </figure>
  )
}

function AccountReader() {
  const { accountId = 'acc-chronicle', entryId } = useParams()
  const account = getAccount(accountId)
  const ordered = getAccountEntries(accountId)
  const entry = entryId ? getEntry(entryId) : ordered[0]
  if (!account || !entry || entry.accountId !== accountId) return <NotFound />
  return (
    <Reader
      key={account.id}
      account={account}
      entry={entry}
      ordered={ordered}
    />
  )
}

function Reader({
  account,
  entry,
  ordered,
}: {
  account: Account
  entry: Entry
  ordered: Entry[]
}) {
  const [view, setView] = useState<'panels' | 'transcript'>('panels')
  const [saved, toggleSaved] = useBookmark(entry.id)
  const contentsRef = useRef<HTMLDialogElement>(null)
  const imageRef = useRef<HTMLDialogElement>(null)
  const [expanded, setExpanded] = useState<Panel | null>(null)
  const index = ordered.findIndex((item) => item.id === entry.id)
  const comic = account.format === 'chronicle'
  const Icon = icons[account.icon]
  useEffect(() => {
    document.title = `${entry.title} · The Hollow Crown`
  }, [entry.title])
  function expand(panel: Panel) {
    setExpanded(panel)
    imageRef.current?.showModal()
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            <span className="gold-diamond">◆</span>{' '}
            {comic
              ? 'THE SHARED ADVENTURE'
              : formatNames[account.format].toUpperCase()}
          </p>
          <h1>{account.title}</h1>
          <p className="page-description">
            {comic
              ? 'Deeds remembered. Legends in the making.'
              : account.description}
          </p>
        </div>
        <div className="heading-emblem">
          <Icon size={43} strokeWidth={0.8} />
          <span>THE HOLLOW CROWN</span>
        </div>
      </div>
      <div className="chapter-toolbar">
        <button
          className="contents-button"
          onClick={() => contentsRef.current?.showModal()}
        >
          <List size={17} />
          <span>
            {comic ? 'Chapter' : 'Entry'} {roman[index] || index + 1}{' '}
            <span className="muted">
              of {roman[ordered.length - 1] || ordered.length}
            </span>
          </span>
          <ChevronDown size={14} />
        </button>
        <div className="reader-controls">
          {comic && (
            <div className="view-switch" aria-label="Reading format">
              <button
                aria-pressed={view === 'panels'}
                className={view === 'panels' ? 'selected' : ''}
                onClick={() => setView('panels')}
              >
                <Grid2X2 size={14} />
                <span>Panels</span>
              </button>
              <button
                aria-pressed={view === 'transcript'}
                className={view === 'transcript' ? 'selected' : ''}
                onClick={() => setView('transcript')}
              >
                <BookOpen size={14} />
                <span>Transcript</span>
              </button>
            </div>
          )}
          <span className="toolbar-divider" />
          <button
            className={`icon-button bookmark ${saved ? 'is-saved' : ''}`}
            onClick={toggleSaved}
            aria-label={saved ? 'Remove bookmark' : 'Bookmark this entry'}
            aria-pressed={saved}
            title={
              saved ? 'Bookmarked on this device' : 'Bookmark on this device'
            }
          >
            <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      <article
        className={`entry ${comic ? 'chronicle-entry' : `written-entry ${account.format}`}`}
      >
        <header className="entry-header">
          <p className="eyebrow">
            {comic
              ? `CHAPTER ${roman[index] || index + 1}`
              : account.author.toUpperCase()}
            <span>·</span>
            {entry.dateLabel}
          </p>
          <h2>{entry.title}</h2>
          <p>{entry.subtitle}</p>
          <div className="entry-ornament">
            <span />✦<span />
          </div>
        </header>
        {comic && view === 'panels' ? (
          <div className="comic-grid">
            {entry.panels.map((panel, i) => (
              <ComicPanel
                key={`${entry.id}-${panel.id}`}
                panel={panel}
                index={i}
                onExpand={expand}
              />
            ))}
          </div>
        ) : (
          <div className="prose">
            {!comic && (
              <div className="manuscript-icon">
                <Icon size={28} strokeWidth={1} />
              </div>
            )}
            {comic && (
              <p className="transcript-note">
                The complete narration and dialogue, in reading order.
              </p>
            )}
            {comic &&
              entry.panels.map((panel, i) => (
                <section className="transcript-panel" key={panel.id}>
                  <p className="eyebrow">PANEL {i + 1}</p>
                  {panel.narration && <p>{panel.narration}</p>}
                  {panel.dialogue?.map((line, j) => (
                    <p key={j}>
                      <strong>{line.speaker}:</strong> “{line.text}”
                    </p>
                  ))}
                </section>
              ))}
            <ReactMarkdown>{entry.body}</ReactMarkdown>
          </div>
        )}
        <div className="chapter-end">
          <span />✧<span />
          <p>
            {comic
              ? 'And so the story continues.'
              : 'A page from another perspective.'}
          </p>
        </div>
      </article>
      <nav className="chapter-pagination" aria-label="Entry navigation">
        {index > 0 ? (
          <Link to={entryPath(ordered[index - 1])} className="previous-entry">
            <ArrowLeft size={18} />
            <span>
              <small>PREVIOUS {comic ? 'CHAPTER' : 'ENTRY'}</small>
              {ordered[index - 1].title}
            </span>
          </Link>
        ) : (
          <span className="beginning">
            <Feather size={17} />
            The beginning of this account
          </span>
        )}
        {index < ordered.length - 1 ? (
          <Link to={entryPath(ordered[index + 1])} className="next-entry">
            <span>
              <small>NEXT {comic ? 'CHAPTER' : 'ENTRY'}</small>
              {ordered[index + 1].title}
            </span>
            <ArrowRight size={20} />
          </Link>
        ) : (
          <div className="caught-up">
            <Sparkles size={18} />
            <span>
              You’re caught up.
              <small>The next page is still being written.</small>
            </span>
          </div>
        )}
      </nav>
      {comic && <AccountCards />}
      <dialog
        ref={contentsRef}
        className="contents-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) contentsRef.current?.close()
        }}
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">{account.title}</p>
            <h2>Table of contents</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close table of contents"
            onClick={() => contentsRef.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <div className="chapter-list">
          {ordered.map((item, i) => (
            <Link
              to={entryPath(item)}
              className={item.id === entry.id ? 'current-chapter' : ''}
              key={item.id}
              onClick={() => contentsRef.current?.close()}
            >
              <span className="chapter-roman">{roman[i] || i + 1}</span>
              <span>
                <strong>{item.title}</strong>
                <small>
                  {item.dateLabel} · {item.readTime}
                </small>
              </span>
              <ChevronRight size={17} />
            </Link>
          ))}
        </div>
      </dialog>
      <dialog
        ref={imageRef}
        className="image-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) imageRef.current?.close()
        }}
      >
        <button
          className="lightbox-close"
          onClick={() => imageRef.current?.close()}
          aria-label="Close illustration"
        >
          <X size={22} />
        </button>
        {expanded && (
          <>
            <img src={assetUrl(expanded.image)} alt={expanded.alt} />
            <p>{expanded.alt}</p>
          </>
        )}
      </dialog>
    </>
  )
}

function Archive() {
  useEffect(() => {
    document.title = 'The complete archive · The Hollow Crown'
  }, [])
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">A WORLD, REMEMBERED</p>
          <h1>The complete archive</h1>
          <p className="page-description">
            One adventure, told in many voices.
          </p>
        </div>
        <Library className="archive-emblem" size={48} strokeWidth={1} />
      </div>
      <div className="archive-grid">
        {accounts.map((account) => {
          const Icon = icons[account.icon]
          return (
            <section className="archive-account" key={account.id}>
              <Icon size={28} strokeWidth={1} />
              <p className="eyebrow">{formatNames[account.format]}</p>
              <h2>{account.title}</h2>
              <p>{account.description}</p>
              <div>
                {getAccountEntries(account.id).map((entry) => (
                  <Link key={entry.id} to={entryPath(entry)}>
                    <span>{entry.title}</span>
                    <ArrowRight size={16} />
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}

function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const tokens = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  const results = tokens.length
    ? entries.filter((entry) => {
        const text = [
          entry.title,
          entry.summary,
          entry.body,
          ...entry.panels.flatMap((p) => [
            p.narration,
            ...(p.dialogue || []).map((d) => `${d.speaker} ${d.text}`),
          ]),
        ]
          .join(' ')
          .toLocaleLowerCase()
        return tokens.every((token) => text.includes(token))
      })
    : []
  useEffect(() => {
    document.title = 'Search the archive · The Hollow Crown'
  }, [])
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">FOLLOW A THREAD</p>
          <h1>Search the archive</h1>
          <p className="page-description">
            Find a remembered place, a whispered name, a turn in the story.
          </p>
        </div>
      </div>
      <div className="search-input">
        <Search size={22} />
        <input
          autoFocus
          aria-label="Search the archive"
          value={query}
          placeholder="A name, a place, a few remembered words…"
          onChange={(e) =>
            setParams(e.target.value ? { q: e.target.value } : {}, {
              replace: true,
            })
          }
        />
        {query && (
          <button
            className="icon-button"
            aria-label="Clear search"
            onClick={() => setParams({})}
          >
            <X size={18} />
          </button>
        )}
      </div>
      <div aria-live="polite" className="search-results">
        {!tokens.length ? (
          <div className="search-empty">
            <Compass size={34} strokeWidth={1} />
            <h2>There’s a story in every detail.</h2>
            <p>Try “crown”, “bell”, or “Elara” in this demo archive.</p>
          </div>
        ) : (
          <>
            <p className="result-count">
              {results.length} {results.length === 1 ? 'entry' : 'entries'}{' '}
              found
            </p>
            {results.length === 0 && (
              <div className="search-empty">
                <h2>No traces found.</h2>
                <p>
                  Try fewer words, or{' '}
                  <Link to="/archive">browse the archive</Link>.
                </p>
              </div>
            )}
            {results.map((entry) => (
              <Link
                className="search-result"
                to={entryPath(entry)}
                key={entry.id}
              >
                <p className="eyebrow">{getAccount(entry.accountId)?.title}</p>
                <h2>{entry.title}</h2>
                <p>{entry.summary}</p>
                <ArrowRight size={18} />
              </Link>
            ))}
          </>
        )}
      </div>
    </>
  )
}

function NotFound() {
  return (
    <div className="not-found">
      <Compass size={48} strokeWidth={1} />
      <p className="eyebrow">BEYOND THE MAP</p>
      <h1>This page hasn’t been written.</h1>
      <p>The account or entry you followed could not be found.</p>
      <Link to="/" className="primary-link">
        <ArrowLeft size={16} />
        Return to the Chronicle
      </Link>
    </div>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        navigate('/search')
      }
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', keyboard)
    return () => window.removeEventListener('keydown', keyboard)
  }, [navigate])
  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
    if (location.pathname !== '/search')
      mainRef.current?.focus({ preventScroll: true })
  }, [location.pathname])
  const account = accounts.find((item) => location.pathname.includes(item.id))
  const section = location.pathname.startsWith('/search')
    ? 'Search'
    : location.pathname === '/archive'
      ? 'Complete archive'
      : account?.title || 'Campaign Chronicle'
  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : ''}`}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          mainRef.current?.focus()
        }}
      >
        Skip to content
      </a>
      {menuOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <Sidebar onClose={() => setMenuOpen(false)} />
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumbs">
            <Link to="/archive">The archive</Link>
            <ChevronRight size={12} />
            <span>{section}</span>
          </div>
          <Link className="search-trigger" to="/search">
            <Search size={15} />
            <span>Search the archive</span>
            <kbd>⌘ K</kbd>
          </Link>
        </header>
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="page-content"
        >
          <Routes>
            <Route path="/" element={<AccountReader />} />
            <Route path="/accounts/:accountId" element={<AccountReader />} />
            <Route
              path="/accounts/:accountId/:entryId"
              element={<AccountReader />}
            />
            <Route path="/archive" element={<Archive />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <footer className="page-footer">
            <span>
              THE HOLLOW CROWN <span>✦</span> A SHARED ADVENTURE
            </span>
            <p>Design preview · Fictional story and characters</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
