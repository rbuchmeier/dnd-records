import { useState } from 'react'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { assetUrl, getAccount } from '../lib/content'
import type { SessionDesignProps } from './shared'
import { entryHref, formatSessionDate, visibleEntries } from './shared'
import './wheel.css'

const WHEEL_PAGE_SIZE = 8

export default function WheelDesign({
  sessions,
  enabledAccountIds,
}: SessionDesignProps) {
  const [chosenId, setChosenId] = useState<string | null>(null)
  const selectedIndex = Math.max(
    0,
    sessions.findIndex((session) => session.id === chosenId),
  )
  const selected = sessions[selectedIndex]
  const page = Math.floor(selectedIndex / WHEEL_PAGE_SIZE)
  const pageCount = Math.ceil(sessions.length / WHEEL_PAGE_SIZE)
  const wheelSessions = sessions.slice(
    page * WHEEL_PAGE_SIZE,
    (page + 1) * WHEEL_PAGE_SIZE,
  )

  if (!selected) {
    return (
      <div className="wheel-design wheel-empty-archive">
        <Sparkles aria-hidden="true" size={28} />
        <p>The chronicle awaits its first session.</p>
      </div>
    )
  }

  const entries = visibleEntries(selected, enabledAccountIds)
  const chronicles = entries.filter(
    (entry) => getAccount(entry.accountId)?.format === 'chronicle',
  )
  const perspectives = entries.filter(
    (entry) => getAccount(entry.accountId)?.format !== 'chronicle',
  )

  return (
    <div className="wheel-design">
      <div className="wheel-layout">
        <aside className="wheel-navigator" aria-label="Choose a session">
          <div className="wheel-heading">
            <span className="wheel-kicker">THE CHRONICLE WHEEL</span>
            <h2>Where shall we turn?</h2>
            <p>Choose a chapter from the stars or the record below.</p>
          </div>

          <div
            className="wheel-astrolabe"
            aria-label="Sessions arranged clockwise from newest"
          >
            <div className="wheel-astrolabe-face" aria-hidden="true">
              <div className="wheel-astrolabe-ring" />
              <div className="wheel-astrolabe-center">
                <Compass size={34} strokeWidth={1} />
                <span>
                  THE
                  <br />
                  HOLLOW
                  <br />
                  CROWN
                </span>
                <i>✦</i>
              </div>
              <span className="wheel-engraving wheel-engraving-n">N</span>
              <span className="wheel-engraving wheel-engraving-e">E</span>
              <span className="wheel-engraving wheel-engraving-s">S</span>
              <span className="wheel-engraving wheel-engraving-w">W</span>
            </div>
            {wheelSessions.map((session, index) => {
              const angle = (index * Math.PI * 2) / wheelSessions.length
              const isSelected = session.id === selected.id
              return (
                <button
                  className={`wheel-node${isSelected ? ' wheel-node-active' : ''}`}
                  type="button"
                  key={session.id}
                  aria-label={`Session ${session.number}: ${session.title}, ${formatSessionDate(session.playedOn)}`}
                  aria-pressed={isSelected}
                  onClick={() => setChosenId(session.id)}
                  style={{
                    left: `${50 + 39 * Math.sin(angle)}%`,
                    top: `${50 - 39 * Math.cos(angle)}%`,
                  }}
                >
                  <span>{String(session.number).padStart(2, '0')}</span>
                </button>
              )
            })}
          </div>

          {pageCount > 1 && (
            <div className="wheel-page-controls" aria-label="Wheel pages">
              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setChosenId(sessions[(page - 1) * WHEEL_PAGE_SIZE].id)
                }
                aria-label="Previous sessions on wheel"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span>
                {page + 1} / {pageCount}
              </span>
              <button
                type="button"
                disabled={page === pageCount - 1}
                onClick={() =>
                  setChosenId(sessions[(page + 1) * WHEEL_PAGE_SIZE].id)
                }
                aria-label="Next sessions on wheel"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div className="wheel-record">
            <div className="wheel-record-title">
              <span>SESSION RECORD</span>
              <span>{String(sessions.length).padStart(2, '0')} CHAPTERS</span>
            </div>
            <div
              className="wheel-session-list"
              role="group"
              aria-label="All sessions, newest first"
            >
              {sessions.map((session) => (
                <button
                  className={`wheel-session-option${session.id === selected.id ? ' wheel-session-option-active' : ''}`}
                  key={session.id}
                  type="button"
                  aria-pressed={session.id === selected.id}
                  onClick={() => setChosenId(session.id)}
                >
                  <span className="wheel-session-option-number">
                    {String(session.number).padStart(2, '0')}
                  </span>
                  <span className="wheel-session-option-copy">
                    <strong>{session.title}</strong>
                    <small>{formatSessionDate(session.playedOn)}</small>
                  </span>
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <article className="wheel-dossier" data-session-id={selected.id}>
          <div className="wheel-dossier-topline">
            <span>
              ILLUMINATED RECORD · NO.{' '}
              {String(selected.number).padStart(2, '0')}
            </span>
            <span>✦</span>
            <span>{formatSessionDate(selected.playedOn)}</span>
          </div>

          <div className="wheel-hero">
            {selected.image && <img src={assetUrl(selected.image)} alt="" />}
            <div className="wheel-hero-shade" />
            <div className="wheel-hero-copy">
              <span className="wheel-hero-eyebrow">
                SESSION {String(selected.number).padStart(2, '0')}
              </span>
              <h2>{selected.title}</h2>
              {selected.location && (
                <span className="wheel-hero-location">
                  ✦ &nbsp; {selected.location}
                </span>
              )}
            </div>
          </div>

          <div className="wheel-dossier-body">
            <div className="wheel-summary">
              <span className="wheel-section-label">THE TALE UNFOLDS</span>
              <p>{selected.summary}</p>
              {chronicles.length > 0 && (
                <div className="wheel-primary-links">
                  {chronicles.map((entry) => (
                    <Link
                      className="wheel-primary-link"
                      key={entry.id}
                      data-entry-id={entry.id}
                      data-account-id={entry.accountId}
                      to={entryHref(entry)}
                    >
                      Read {entry.title}
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {perspectives.length > 0 && (
              <div className="wheel-perspectives">
                <div className="wheel-perspectives-heading">
                  <span className="wheel-section-label">
                    VOICES FROM THIS CHAPTER
                  </span>
                  <span>{String(perspectives.length).padStart(2, '0')}</span>
                </div>
                {perspectives.map((entry) => {
                  const account = getAccount(entry.accountId)
                  const art = entry.panels[0]?.image
                  return (
                    <Link
                      className="wheel-perspective-card"
                      key={entry.id}
                      data-entry-id={entry.id}
                      data-account-id={entry.accountId}
                      to={entryHref(entry)}
                    >
                      {art && <img src={assetUrl(art)} alt="" />}
                      <span className="wheel-perspective-copy">
                        <small>{account?.title ?? 'A companion account'}</small>
                        <strong>{entry.title}</strong>
                        <span>{entry.summary}</span>
                      </span>
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  )
                })}
              </div>
            )}
            {entries.length === 0 && (
              <p className="wheel-no-entries">
                No accounts selected for this session.
              </p>
            )}
          </div>
          <div className="wheel-dossier-footer">
            ✦ &nbsp; THE HOLLOW CROWN &nbsp; ✦
          </div>
        </article>
      </div>
    </div>
  )
}
