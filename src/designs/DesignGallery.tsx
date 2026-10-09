import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Feather,
  Layers,
  Orbit,
  Sparkles,
} from 'lucide-react'
import { accounts, entries, sessions, assetUrl } from '../lib/content'
import TimelineDesign from './TimelineDesign'
import WheelDesign from './WheelDesign'
import FolioDesign from './FolioDesign'
import './gallery.css'

const options = [
  {
    id: 'timeline',
    number: '01',
    name: 'The Story Thread',
    label: 'Vertical timeline',
    description:
      'Follow the adventure down a golden thread. Each session gathers the Chronicle and its accompanying voices in one place.',
    strength: 'Best for catching up at a glance',
    icon: Layers,
  },
  {
    id: 'wheel',
    number: '02',
    name: 'The Chronicle Wheel',
    label: 'Interactive astrolabe',
    description:
      'Turn to a session on a celestial wheel, then open its stories. A more atmospheric way to explore the same history.',
    strength: 'Best for exploring one session at a time',
    icon: Orbit,
  },
  {
    id: 'folio',
    number: '03',
    name: 'The Session Folio',
    label: 'An issue for every gathering',
    description:
      'The newest adventure opens like a freshly bound volume. Unfold earlier sessions from the archive below.',
    strength: 'Best for a weekly reading ritual',
    icon: BookOpen,
  },
]

const playerAccounts = accounts.filter(
  (account) => account.format !== 'chronicle',
)
const filterIcons = {
  letters: Feather,
  journal: Compass,
  compendium: Sparkles,
  chronicle: BookOpen,
}
const filterLabels = {
  letters: 'Letters',
  journal: 'Field notes',
  compendium: 'Compendium',
  chronicle: 'Chronicle',
}

export default function DesignGallery() {
  const { design } = useParams()
  const [params, setParams] = useSearchParams()
  const selected = options.find((option) => option.id === design)
  const enabledAccountIds = params.has('notes')
    ? (params.get('notes') || '')
        .split(',')
        .filter((id) => playerAccounts.some((account) => account.id === id))
    : playerAccounts.map((account) => account.id)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  useEffect(() => {
    document.title = `${selected?.name || 'Session design gallery'} · The Hollow Crown`
  }, [selected?.name])
  function setEnabled(ids: string[]) {
    const next = new URLSearchParams(params)
    if (ids.length === playerAccounts.length) next.delete('notes')
    else next.set('notes', ids.length ? ids.join(',') : 'none')
    setParams(next, { replace: true })
  }

  if (design && !selected)
    return (
      <section className="design-missing">
        <h1>That design isn’t in the collection.</h1>
        <Link to="/designs">Return to the design gallery</Link>
      </section>
    )

  return (
    <div
      className={`design-gallery ${selected ? `design-option-${selected.id}` : 'design-overview'}`}
    >
      <header className="design-intro">
        <p className="eyebrow">
          <span>✦</span> THE CAMPAIGN, RECOLLECTED
        </p>
        <h1>
          {selected ? selected.name : 'The adventure, session by session.'}
        </h1>
        <p>
          {selected
            ? selected.description
            : 'Every gathering adds a chapter. Choose a way to bring all its stories together.'}
        </p>
        <div className="design-intro-meta">
          <span>{sessions.length} sample sessions</span>
          <span>Newest first</span>
          <span>Fictional demo dates</span>
        </div>
      </header>

      {!selected ? (
        <>
          <div className="design-choice-grid">
            {options.map((option) => {
              const Icon = option.icon
              return (
                <Link
                  className={`design-choice choice-${option.id}`}
                  to={`/designs/${option.id}${suffix}`}
                  key={option.id}
                >
                  <div className="design-miniature" aria-hidden="true">
                    <span className="design-miniature-number">
                      {option.number}
                    </span>
                    {option.id === 'timeline' && (
                      <div className="mini-thread">
                        <span />
                        <div>
                          <img src={assetUrl('art/relic.webp')} alt="" />
                          <i />
                          <i />
                        </div>
                        <span />
                        <div>
                          <img src={assetUrl('art/threshold.webp')} alt="" />
                          <i />
                        </div>
                      </div>
                    )}
                    {option.id === 'wheel' && (
                      <div className="mini-wheel">
                        <div>
                          <span>III</span>
                          <span>II</span>
                          <span>I</span>
                          <Compass size={58} strokeWidth={0.7} />
                        </div>
                        <p>THE HOLLOW CROWN</p>
                      </div>
                    )}
                    {option.id === 'folio' && (
                      <div className="mini-folio">
                        <div>THE SESSION FOLIO</div>
                        <img src={assetUrl('art/arrival.webp')} alt="" />
                        <span>III · Beneath the old stones</span>
                        <i />
                        <i />
                      </div>
                    )}
                  </div>
                  <div className="design-choice-content">
                    <p className="eyebrow">
                      <Icon size={13} />
                      {option.label}
                    </p>
                    <h2>{option.name}</h2>
                    <p>{option.description}</p>
                    <small>{option.strength}</small>
                    <span className="design-open">
                      Explore this design <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="design-common">
            <BookOpen size={24} strokeWidth={1} />
            <div>
              <h2>The same story. Three ways in.</h2>
              <p>
                Each option groups the comic Chronicle, letters, notes, and
                discoveries by play session. Player-account toggles follow you
                between designs. Every entry opens in the existing reader.
              </p>
            </div>
          </div>
          <Link className="design-original" to="/">
            <ArrowLeft size={15} />
            Open the new continuous Chronicle
          </Link>
        </>
      ) : (
        <>
          <nav className="design-switcher" aria-label="Design options">
            <Link to={`/designs${suffix}`} className="design-all">
              <ArrowLeft size={14} />
              <span>All designs</span>
            </Link>
            <div>
              {options.map((option) => (
                <Link
                  to={`/designs/${option.id}${suffix}`}
                  key={option.id}
                  aria-current={option.id === selected.id ? 'page' : undefined}
                >
                  <span>{option.number}</span>
                  {option.label}
                </Link>
              ))}
            </div>
          </nav>
          <section className="design-filters" aria-label="Account visibility">
            <div className="design-filter-top">
              <div>
                <p className="eyebrow">VOICES AT THE TABLE</p>
                <p>
                  Choose which player accounts appear alongside the Chronicle.
                </p>
              </div>
              <span className="design-sort-label">
                Latest session first <span>↓</span>
              </span>
            </div>
            <div className="design-filter-controls">
              <span className="design-fixed-filter">
                <BookOpen size={15} />
                Chronicle<small>Always shown</small>
              </span>
              {playerAccounts.map((account) => {
                const Icon = filterIcons[account.format]
                const checked = enabledAccountIds.includes(account.id)
                return (
                  <label
                    key={account.id}
                    className={`design-filter ${checked ? 'enabled' : ''}`}
                    title={account.title}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      aria-label={`Show ${filterLabels[account.format]}`}
                      onChange={() =>
                        setEnabled(
                          checked
                            ? enabledAccountIds.filter(
                                (id) => id !== account.id,
                              )
                            : [...enabledAccountIds, account.id],
                        )
                      }
                    />
                    <span className="filter-check" aria-hidden="true">
                      {checked && <Check size={11} />}
                    </span>
                    <Icon size={14} />
                    <span>
                      {filterLabels[account.format]}
                      <small>{account.author}</small>
                    </span>
                  </label>
                )
              })}
            </div>
            <div className="design-filter-footer">
              <p aria-live="polite">
                {
                  entries.filter(
                    (entry) =>
                      getChronicle(entry.accountId) ||
                      enabledAccountIds.includes(entry.accountId),
                  ).length
                }{' '}
                entries across {sessions.length} sessions
              </p>
              <div>
                <button onClick={() => setEnabled([])}>Chronicle only</button>
                <span>·</span>
                <button
                  onClick={() =>
                    setEnabled(playerAccounts.map((account) => account.id))
                  }
                >
                  Show all voices
                </button>
              </div>
            </div>
          </section>
          <div className="design-canvas">
            {selected.id === 'timeline' ? (
              <TimelineDesign
                sessions={sessions}
                enabledAccountIds={enabledAccountIds}
              />
            ) : selected.id === 'wheel' ? (
              <WheelDesign
                sessions={sessions}
                enabledAccountIds={enabledAccountIds}
              />
            ) : (
              <FolioDesign
                sessions={sessions}
                enabledAccountIds={enabledAccountIds}
              />
            )}
          </div>
          <div className="design-comparison-note">
            <span>DESIGN {selected.number}</span>
            <p>
              {selected.strength}. Switch designs above to compare the same
              sessions.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function getChronicle(accountId: string) {
  return accounts.some(
    (account) => account.id === accountId && account.format === 'chronicle',
  )
}
