import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CardGrid from './components/CardGrid'
import Guide from './components/Guide'
import { useSuCards } from './SuCardContext'
import { fetchCards } from './api'

export default function App() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showGuide, setShowGuide] = useState(false)
  const { customCards } = useSuCards()

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

  if (showGuide) {
    return <Guide onBack={() => setShowGuide(false)} />
  }

  const ownedCount = cards.filter((c) => c.has_card).length
  const totalCount = cards.length

  // 将自定义 SuCard 转为 Card 组件兼容格式
  const customCardData = customCards.map((c) => ({
    card_number: `custom-${c.id.slice(0, 8)}`,
    name: c.name,
    has_card: true,
    front_image: c.imageUrl,
    back_image: '/images/cards/back.png',
    is_custom: true,
    custom_id: c.id,
  }))

  const allCards = [...customCardData, ...cards]

  return (
    <div className="app">
      {/* ── Nav Bar ── */}
      <nav className="nav-bar">
        <Link to="/" className="logo">SuCards</Link>
        <div className="nav-actions">
          <Link to="/generate" className="btn-pill btn-pill-sm">
            + 创建
          </Link>
          <button className="btn-pill btn-pill-sm" onClick={() => setShowGuide(true)}>
            指南
          </button>
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
          {customCards.length > 0 && (
            <span className="stats-pill">
              自定义 <strong>{customCards.length}</strong>
            </span>
          )}
          <Link to="/generate" className="btn-pill">
            + 创建 SuCard →
          </Link>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider" />

      {/* ── Card Grid ── */}
      <main>
        <CardGrid cards={allCards} />
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>SuCards 收藏集 · Cloudflare Pages</p>
      </footer>
    </div>
  )
}
