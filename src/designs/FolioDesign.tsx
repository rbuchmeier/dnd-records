import { ArrowUpRight, BookOpen, Feather, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { assetUrl, getAccount } from '../lib/content'
import type { SessionDesignProps } from './shared'
import { entryHref, formatSessionDate, visibleEntries } from './shared'
import './folio.css'

function IssueNumber({ number }: { number: number }) {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
  return (
    <span className="folio-issue-number">{roman[number - 1] ?? number}</span>
  )
}

export default function FolioDesign({
  sessions,
  enabledAccountIds,
}: SessionDesignProps) {
  return (
    <div className="folio-archive">
      {sessions.map((session, index) => {
        const entries = visibleEntries(session, enabledAccountIds)
        const chronicles = entries.filter(
          (entry) => getAccount(entry.accountId)?.format === 'chronicle',
        )
        const perspectives = entries.filter(
          (entry) => getAccount(entry.accountId)?.format !== 'chronicle',
        )
        const isLatest = index === 0
        if (isLatest) {
          return (
            <article
              className="folio-latest"
              data-session-id={session.id}
              key={session.id}
            >
              <header className="folio-masthead">
                <span>THE HOLLOW CROWN</span>
                <span>
                  CAMPAIGN PAPERS <i>✦</i> WEEKLY ISSUE
                </span>
              </header>
              <div className="folio-issue">
                <div className="folio-issue-meta">
                  <span className="folio-issue-seal">
                    <IssueNumber number={session.number} />
                  </span>
                  <span>SESSION {String(session.number).padStart(2, '0')}</span>
                  <span className="folio-meta-rule" />
                  <time>{formatSessionDate(session.playedOn)}</time>
                </div>
                <div className="folio-feature">
                  {session.image && (
                    <div className="folio-artwork">
                      <img src={assetUrl(session.image)} alt="" />
                      <span>
                        THE CHRONICLE · ISSUE{' '}
                        {String(session.number).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  <div className="folio-feature-copy">
                    <span className="folio-eyebrow">A NEW CHAPTER UNFOLDS</span>
                    <h2>{session.title}</h2>
                    <p className="folio-deck">
                      {session.summary || chronicles[0]?.summary}
                    </p>
                    {session.location && (
                      <span className="folio-location">
                        <MapPin size={13} /> {session.location}
                      </span>
                    )}
                    {chronicles.length > 0 && (
                      <div className="folio-feature-links">
                        {chronicles.map((entry) => (
                          <Link
                            className="folio-feature-link"
                            data-entry-id={entry.id}
                            data-account-id={entry.accountId}
                            key={entry.id}
                            to={entryHref(entry)}
                          >
                            <BookOpen size={15} /> Read {entry.title}{' '}
                            <ArrowUpRight size={15} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="folio-current-contents">
                {perspectives.length > 0 && (
                  <p className="folio-section-label">VOICES FROM THE TABLE</p>
                )}
                {perspectives.length > 0 && (
                  <div
                    className="folio-perspectives"
                    aria-label="Player perspectives"
                  >
                    {perspectives.map((entry) => {
                      const account = getAccount(entry.accountId)
                      const panel = entry.panels[0]
                      return (
                        <Link
                          className="folio-perspective"
                          data-entry-id={entry.id}
                          data-account-id={entry.accountId}
                          key={entry.id}
                          to={entryHref(entry)}
                        >
                          <span className="folio-perspective-icon">
                            <Feather size={15} />
                          </span>
                          {panel && <img src={assetUrl(panel.image)} alt="" />}
                          <span className="folio-perspective-copy">
                            <span>
                              {account?.title ?? 'A companion account'}
                            </span>
                            <strong>{entry.title}</strong>
                          </span>
                          <ArrowUpRight
                            className="folio-perspective-arrow"
                            size={15}
                          />
                        </Link>
                      )
                    })}
                  </div>
                )}
                {entries.length === 0 && (
                  <p className="folio-empty">
                    No accounts selected for this session.
                  </p>
                )}
              </div>
            </article>
          )
        }

        return (
          <details
            className="folio-back-issue"
            data-session-id={session.id}
            key={session.id}
          >
            <summary>
              <span className="folio-back-number">
                <IssueNumber number={session.number} />
              </span>
              <span className="folio-back-title">
                <span>SESSION {String(session.number).padStart(2, '0')}</span>
                <strong>{session.title}</strong>
              </span>
              <time>{formatSessionDate(session.playedOn)}</time>
              {session.location && (
                <span className="folio-back-location">{session.location}</span>
              )}
              <span className="folio-disclose" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="folio-back-content">
              <div className="folio-back-intro">
                {session.image && <img src={assetUrl(session.image)} alt="" />}
                <p>{session.summary}</p>
              </div>
              {session.body && (
                <div className="folio-entry-body folio-session-body">
                  <ReactMarkdown>{session.body}</ReactMarkdown>
                </div>
              )}
              {entries.map((entry) => {
                const account = getAccount(entry.accountId)
                return (
                  <section
                    className="folio-back-entry"
                    data-entry-id={entry.id}
                    data-account-id={entry.accountId}
                    key={entry.id}
                  >
                    <div className="folio-back-entry-heading">
                      <span>{account?.title ?? 'Campaign account'}</span>
                      <Link to={entryHref(entry)}>
                        {entry.title} <ArrowUpRight size={14} />
                      </Link>
                    </div>
                    <div className="folio-entry-body">
                      <ReactMarkdown>{entry.body}</ReactMarkdown>
                    </div>
                  </section>
                )
              })}
              {entries.length === 0 && (
                <p className="folio-empty">
                  No accounts selected for this session.
                </p>
              )}
            </div>
          </details>
        )
      })}
    </div>
  )
}
