import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSuCards } from '../SuCardContext'
import './CardDetail.css'

const RARITY_COLORS = {
  N: 'var(--mute)',
  R: 'var(--accent-breeze)',
  SR: 'var(--accent-dusk)',
  SSR: 'var(--accent-sunset)',
}

const TYPE_LABELS = {
  portrait: 'Portrait Card',
  scene: 'Scene Card',
}

export default function CardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCard, removeCard } = useSuCards()

  const card = getCard(id)

  if (!card) {
    return (
      <div className="detail-page">
        <nav className="nav-bar">
          <Link to="/" className="logo">SuCards</Link>
          <Link to="/" className="btn-pill btn-pill-sm">← Back</Link>
        </nav>
        <div className="loading-screen">
          <p className="error">Card not found</p>
          <p style={{ color: 'var(--mute)', fontSize: '14px' }}>
            This card may have been deleted or the URL is incorrect.
          </p>
          <Link to="/" className="btn-pill">Return Home</Link>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    removeCard(card.id)
    navigate('/')
  }

  const createdAt = new Date(card.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="detail-page">
      {/* ── Nav Bar ── */}
      <nav className="nav-bar">
        <Link to="/" className="logo">SuCards</Link>
        <Link to="/" className="btn-pill btn-pill-sm">← Back</Link>
      </nav>

      {/* ── Card Detail Layout ── */}
      <main className="detail-content">
        <div className="detail-grid">
          {/* ── Left: Card Image ── */}
          <div className="detail-image-wrap">
            <div className="detail-image-card">
              <img
                src={card.imageUrl}
                alt={card.name}
                className="detail-image"
              />
            </div>
          </div>

          {/* ── Right: Card Info ── */}
          <div className="detail-info">
            <p className="detail-eyebrow">
              SuCard · No. {card.number}
            </p>
            <h1 className="detail-title">{card.name}</h1>

            <div className="detail-tags">
              <span
                className="rarity-tag"
                style={{ color: RARITY_COLORS[card.rarity] || 'var(--mute)' }}
              >
                {card.rarity}
              </span>
              <span className="type-tag">
                {TYPE_LABELS[card.type] || card.type}
              </span>
            </div>

            {card.description && (
              <p className="detail-desc">{card.description}</p>
            )}

            {/* ── Specs ── */}
            <div className="detail-specs">
              <div className="spec-row">
                <span className="spec-key">Character</span>
                <span className="spec-val">{card.character}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Rarity</span>
                <span
                  className="spec-val"
                  style={{ color: RARITY_COLORS[card.rarity] || 'var(--mute)' }}
                >
                  {card.rarity}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Type</span>
                <span className="spec-val">{TYPE_LABELS[card.type] || card.type}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Created</span>
                <span className="spec-val">{createdAt}</span>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="detail-actions">
              <Link to="/generate" className="btn-pill">
                + Create Another
              </Link>
              <button className="btn-pill" onClick={handleDelete}>
                Delete
              </button>
            </div>

            {/* ── Share URL ── */}
            <div className="share-section">
              <p className="share-label">Share this card</p>
              <div className="share-url-row">
                <input
                  className="share-input mono"
                  type="text"
                  readOnly
                  value={window.location.href}
                  onClick={(e) => e.target.select()}
                />
                <button
                  className="btn-pill btn-pill-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>SuCards · Card #{card.number}</p>
      </footer>
    </div>
  )
}
