import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CardGrid from './components/CardGrid'
import { fetchCards } from './api'

export default function App() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        <p>卡牌加载中…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p className="error">加载失败：{error}</p>
        <button className="btn-pill" onClick={() => window.location.reload()}>
          重试
        </button>
      </div>
    )
  }

  const ownedCount = cards.filter((c) => c.has_card).length
  const totalCount = cards.length

  return (
    <div className="app">
      {/* ── Nav Bar ── */}
      <nav className="nav-bar">
        <Link to="/" className="logo">SuCards</Link>
        <div className="nav-actions">
          <Link to="/upload" className="btn-pill btn-pill-sm">
            上传
          </Link>
          <Link to="/guide" className="btn-pill btn-pill-sm">
            指南
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <p className="hero-eyebrow">卡牌收藏</p>
        <h1 className="hero-title">SuCards</h1>
        <p className="hero-sub">
          个人 TCG 风格集换式卡牌画廊
        </p>
        <div className="stats-row">
          <span className="stats-pill">
            已拥有 <strong>{ownedCount}</strong> / {totalCount}
          </span>
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
        <p>SuCards 收藏集 · Cloudflare Pages</p>
      </footer>
    </div>
  )
}
