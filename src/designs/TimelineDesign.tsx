import { ArrowUpRight, BookOpen, CalendarDays, Feather } from 'lucide-react'
import { Link } from 'react-router-dom'
import { assetUrl, getAccount } from '../lib/content'
import type { SessionDesignProps } from './shared'
import { entryHref, formatSessionDate, visibleEntries } from './shared'
import './timeline.css'

export default function TimelineDesign({
  sessions,
  enabledAccountIds,
}: SessionDesignProps) {
  return (
    <div className="thread-archive">
      <div className="thread-rail" aria-hidden="true" />
      {sessions.map((session) => {
        const entries = visibleEntries(session, enabledAccountIds)
        const chronicles = entries.filter(
          (entry) => getAccount(entry.accountId)?.format === 'chronicle',
        )
        const perspectives = entries.filter(
          (entry) => getAccount(entry.accountId)?.format !== 'chronicle',
        )

        return (
          <article
            className="thread-session"
            data-session-id={session.id}
            key={session.id}
          >
            <div className="thread-marker">
              <span className="thread-date-seal">
                <CalendarDays size={16} strokeWidth={1.5} />
              </span>
              <span className="thread-date-label">
                {formatSessionDate(session.playedOn)}
              </span>
            </div>

            <div className="thread-session-content">
              <div className="thread-session-heading">
                <span className="thread-session-number">
                  SESSION {String(session.number).padStart(2, '0')}
                </span>
                <span className="thread-session-title">{session.title}</span>
                <span className="thread-heading-rule" />
                {session.location && (
                  <span className="thread-location">{session.location}</span>
                )}
              </div>

              <div className="thread-cards">
                {chronicles.map((chronicle) => {
                  const artwork = session.image || chronicle.panels[0]?.image
                  const hasMultipleChronicles = chronicles.length > 1
                  return (
                    <Link
                      className="thread-chronicle-card"
                      data-entry-id={chronicle.id}
                      data-account-id={chronicle.accountId}
                      key={chronicle.id}
                      to={entryHref(chronicle)}
                    >
                      {artwork && (
                        <div className="thread-artwork">
                          <img src={assetUrl(artwork)} alt="" />
                          <span className="thread-artwork-wash" />
                          <span className="thread-artwork-caption">
                            THE CAMPAIGN CHRONICLE
                          </span>
                        </div>
                      )}
                      <div className="thread-chronicle-copy">
                        <div className="thread-entry-kicker">
                          <BookOpen size={13} strokeWidth={1.6} />
                          <span>THE SHARED STORY</span>
                        </div>
                        <h2>
                          {hasMultipleChronicles
                            ? chronicle.title
                            : session.title}
                        </h2>
                        <p>
                          {hasMultipleChronicles
                            ? chronicle.summary
                            : session.summary || chronicle.summary}
                        </p>
                        <span className="thread-read-link">
                          Read this chapter <ArrowUpRight size={15} />
                        </span>
                      </div>
                      <span className="thread-corner-mark" aria-hidden="true">
                        ✦
                      </span>
                    </Link>
                  )
                })}

                {perspectives.length > 0 && (
                  <div className="thread-perspectives">
                    {perspectives.map((entry) => {
                      const account = getAccount(entry.accountId)
                      const panel = entry.panels[0]
                      return (
                        <Link
                          className="thread-perspective-card"
                          data-entry-id={entry.id}
                          data-account-id={entry.accountId}
                          key={entry.id}
                          to={entryHref(entry)}
                        >
                          <span className="thread-perspective-icon">
                            <Feather size={15} strokeWidth={1.4} />
                          </span>
                          {panel && (
                            <img
                              className="thread-perspective-art"
                              src={assetUrl(panel.image)}
                              alt=""
                            />
                          )}
                          <span className="thread-perspective-copy">
                            <span className="thread-perspective-account">
                              {account?.title ?? 'A companion account'}
                            </span>
                            <strong>{entry.title}</strong>
                            <span className="thread-perspective-summary">
                              {entry.summary}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="thread-perspective-arrow"
                            size={16}
                          />
                        </Link>
                      )
                    })}
                  </div>
                )}

                {entries.length === 0 && (
                  <div className="thread-empty">
                    <span>✧</span>
                    No accounts selected for this session.
                  </div>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
