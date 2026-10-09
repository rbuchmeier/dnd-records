import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { resolveAssetUrl } from '../lib/assets'
import './wireframes.css'

const concepts = [
  { id: 'A1', name: 'The Long Table' },
  { id: 'A2', name: 'The Long Page' },
  { id: 'A3', name: 'Horizontal Strips' },
  { id: 'A4', name: 'Margin Ledger' },
  { id: 'A5', name: 'Thread Ledger' },
]

// Wireframe HTML ships with the app; only campaign artwork lives in R2.
function wireframeUrl(id: string) {
  return resolveAssetUrl(
    `wireframes/${id.toLowerCase()}.html`,
    undefined,
    import.meta.env.BASE_URL,
  )
}

export default function WireframeGallery() {
  const { wireframeId } = useParams()
  const selected = concepts.find(
    (concept) => concept.id === wireframeId?.toUpperCase(),
  )
  const [size, setSize] = useState<'desktop' | 'phone'>(() =>
    window.innerWidth < 700 ? 'phone' : 'desktop',
  )
  useEffect(() => {
    document.title = selected
      ? `${selected.id} · Wireframe study`
      : 'Wireframe studies A1–A5'
  }, [selected])

  if (wireframeId && !selected)
    return (
      <main className="wf-gallery">
        <h1>Unknown wireframe</h1>
        <Link to="/wireframes">All five studies</Link>
      </main>
    )

  return (
    <main className="wf-gallery">
      <header className="wf-header">
        <div>
          <Link className="wf-back" to={selected ? '/wireframes' : '/'}>
            {selected ? '← All five studies' : '← Current reader'}
          </Link>
          <h1>
            {selected
              ? `${selected.id} — ${selected.name}`
              : 'Five independent wireframes'}
          </h1>
          <p>
            Structure, not visual styling. Each agent received only the same
            short requirements brief—no existing code or screenshots.
          </p>
        </div>
      </header>
      {selected ? (
        <>
          <nav className="wf-controls" aria-label="Wireframe studies">
            <div className="wf-tabs">
              {concepts.map((concept) => (
                <Link
                  key={concept.id}
                  to={`/wireframes/${concept.id}`}
                  aria-current={selected.id === concept.id ? 'page' : undefined}
                >
                  {concept.id}
                </Link>
              ))}
            </div>
            <div className="wf-size" role="group" aria-label="Preview size">
              <button
                aria-pressed={size === 'desktop'}
                onClick={() => setSize('desktop')}
              >
                Desktop
              </button>
              <button
                aria-pressed={size === 'phone'}
                onClick={() => setSize('phone')}
              >
                Phone
              </button>
            </div>
            <a
              href={wireframeUrl(selected.id)}
              target="_blank"
              rel="noreferrer"
            >
              Open full-size ↗
            </a>
          </nav>
          <div className={`wf-stage wf-${size}`}>
            <iframe
              key={selected.id}
              src={wireframeUrl(selected.id)}
              title={`${selected.id} wireframe`}
              className="wf-full-preview"
              sandbox="allow-scripts"
            />
          </div>
          <p className="wf-note">
            These are discussion sketches, not changes to the current reader.
            Use A1–A5 when describing what to keep or change.
          </p>
        </>
      ) : (
        <div className="wf-grid">
          {concepts.map((concept) => (
            <Link
              to={`/wireframes/${concept.id}`}
              className="wf-card"
              key={concept.id}
            >
              <div className="wf-thumbnail" aria-hidden="true">
                <iframe
                  src={wireframeUrl(concept.id)}
                  title={`${concept.id} thumbnail`}
                  tabIndex={-1}
                  sandbox=""
                />
              </div>
              <div className="wf-card-label">
                <strong>{concept.id}</strong>
                <span>{concept.name}</span>
                <span aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
