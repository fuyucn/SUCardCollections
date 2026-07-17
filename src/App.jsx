import { useState, useEffect } from 'react'
import CardGrid from './components/CardGrid'
import Guide from './components/Guide'
import { fetchCards } from './api'

export default function App() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    fetchCards()
      .then((data) => {
        setCards(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load cards:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading cards…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p className="error">Failed to load: {error}</p>
        <button className="btn-pill" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  if (showGuide) {
    return <Guide onBack={() => setShowGuide(false)} />
  }

  const ownedCount = cards.filter((c) => c.has_card).length
  const totalCount = cards.length

  return (
    <div className="app">
      {/* ── Nav Bar ── */}
      <nav className="nav-bar">
        <span className="logo">SuCards</span>
        <button className="btn-pill btn-pill-sm" onClick={() => setShowGuide(true)}>
          Guide
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <p className="hero-eyebrow">Card Collection</p>
        <h1 className="hero-title">SuCards</h1>
        <p className="hero-sub">
          A personal TCG-style collectible card gallery
        </p>
        <div className="stats-row">
          <span className="stats-pill">
            Owned <strong>{ownedCount}</strong> / {totalCount}
          </span>
          <button className="btn-pill" onClick={() => setShowGuide(true)}>
            How to make &rarr;
          </button>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider" />

      {/* ── Card Grid ── */}
      <main>
        <CardGrid cards={cards} />
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>SuCards Collection · Cloudflare Pages</p>
      </footer>
    </div>
  )
}
