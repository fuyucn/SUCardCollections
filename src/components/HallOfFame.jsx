import { Link } from 'react-router-dom'
import Keychain from './Keychain'
import './HallOfFame.css'

/** 名人堂挂件数据 — 后续可扩展 */
const ORNAMENTS = [
  { id: 1,  image: '/images/cards/sucard-000.png',         label: '卡面1' },
  { id: 2,  image: '/images/cards/sucard-special.png',     label: '卡面2' },
  { id: 3,  image: '/images/perler-keychain.png',          label: 'PERLER' },
  // 预留扩展位（等待更多卡面 / 拼豆图）
]

export default function HallOfFame() {
  return (
    <div className="hof-page">
      {/* ── 导航 ── */}
      <nav className="nav-bar hof-nav">
        <Link to="/" className="logo">SuCards</Link>
        <div className="nav-actions">
          <Link to="/"  className="btn-pill btn-pill-sm">首页</Link>
          <Link to="/guide" className="btn-pill btn-pill-sm">指南</Link>
        </div>
      </nav>

      {/* ── 标题 ── */}
      <section className="hof-hero">
        <p className="hof-eyebrow">HALL OF FAME</p>
        <h1 className="hof-title">名人堂</h1>
        <p className="hof-sub">拼豆钥匙链 · 收藏展示架</p>
      </section>

      {/* ── 展示架 ── */}
      <div className="hof-rack-area">
        {/* 展示架横梁 */}
        <div className="hof-rack-bar">
          {/* 钉子阵列 */}
          {ORNAMENTS.map((_, i) => (
            <div key={i} className="hof-nail">
              <div className="hof-nail-head" />
            </div>
          ))}
        </div>

        {/* 挂件行 */}
        <div className="hof-ornaments-row">
          {ORNAMENTS.map((item, i) => (
            <div key={item.id} className="hof-slot">
              <Keychain
                image={item.image}
                label={item.label}
                swingDelay={i * 0.18}
                cardWidth={72}
              />
            </div>
          ))}

          {/* 空位占位提示 */}
          {Array.from({ length: Math.max(0, 12 - ORNAMENTS.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="hof-slot hof-slot-empty">
              <div className="hof-empty-hint">
                <span>+</span>
                <small>待添加</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 页脚 ── */}
      <footer className="hof-footer">
        <p>每个挂件都是一段故事 · SuCards 名人堂</p>
      </footer>
    </div>
  )
}
