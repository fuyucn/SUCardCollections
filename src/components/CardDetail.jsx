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
  portrait: '人物卡',
  scene: '场景卡',
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
          <Link to="/" className="btn-pill btn-pill-sm">← 返回</Link>
        </nav>
        <div className="loading-screen">
          <p className="error">卡牌未找到</p>
          <p style={{ color: 'var(--mute)', fontSize: '14px' }}>
            该卡牌可能已被删除，或 URL 地址不正确。
          </p>
          <Link to="/" className="btn-pill">返回首页</Link>
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
        <Link to="/" className="btn-pill btn-pill-sm">← 返回</Link>
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
              SuCard · 编号 {card.number}
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
                <span className="spec-key">角色</span>
                <span className="spec-val">{card.character}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">稀有度</span>
                <span
                  className="spec-val"
                  style={{ color: RARITY_COLORS[card.rarity] || 'var(--mute)' }}
                >
                  {card.rarity}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-key">类型</span>
                <span className="spec-val">{TYPE_LABELS[card.type] || card.type}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">创建时间</span>
                <span className="spec-val">{createdAt}</span>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="detail-actions">
              <Link to="/generate" className="btn-pill">
                + 再创建一张
              </Link>
              <button className="btn-pill" onClick={handleDelete}>
                删除
              </button>
            </div>

            {/* ── Share URL ── */}
            <div className="share-section">
              <p className="share-label">分享此卡牌</p>
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
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>SuCards · 卡牌 #{card.number}</p>
      </footer>
    </div>
  )
}
