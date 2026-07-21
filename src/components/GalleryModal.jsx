import { useState, useEffect, useCallback, useRef } from 'react'
import './GalleryModal.css'

export default function GalleryModal({ cards, initialIndex = 0, onClose }) {
  const valid = cards.filter((c) => c.has_card)
  const [current, setCurrent] = useState(() => {
    if (initialIndex >= 0 && initialIndex < valid.length) return initialIndex
    return 0
  })
  const [flipped, setFlipped] = useState(false)
  const [frontLoaded, setFrontLoaded] = useState(false)
  const [backLoaded, setBackLoaded] = useState(false)

  // ── 翻页（key 变化时自动重置） ──
  const go = useCallback(
    (delta) => {
      setFlipped(false)
      setCurrent((prev) => {
        const nxt = prev + delta
        if (nxt < 0) return valid.length - 1
        if (nxt >= valid.length) return 0
        return nxt
      })
    },
    [valid.length],
  )

  const goNext = useCallback(() => go(1), [go])
  const goPrev = useCallback(() => go(-1), [go])

  // ── 键盘 ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === ' ') {
        e.preventDefault()
        setFlipped((f) => !f)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, goNext, goPrev])

  // ── 触摸滑动 ──
  const touchX = useRef(0)
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    const dx = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 50) (dx > 0 ? goNext : goPrev)()
  }

  // ── 预加载相邻图片 ──
  useEffect(() => {
    const pre = []
    const idx = (i) => {
      if (i < 0) return valid.length - 1
      if (i >= valid.length) return 0
      return i
    }
    ;[idx(current - 1), idx(current + 1)].forEach((i) => {
      const img = new Image()
      img.src = valid[i].front_image
      pre.push(img)
    })
    return () => pre.forEach((img) => { img.src = '' })
  }, [current, valid])

  const card = valid[current]
  if (!card) {
    return (
      <div className="gallery-overlay" onClick={onClose}>
        <div className="gallery-empty">暂无可展示的卡牌</div>
      </div>
    )
  }

  return (
    <div className="gallery-overlay" onClick={onClose}>
      {/* ── 关闭按钮 ── */}
      <button className="gallery-close" onClick={onClose} aria-label="关闭">
        ✕
      </button>

      {/* ── 主区域（不冒泡到 overlay） ── */}
      <div className="gallery-body" onClick={(e) => e.stopPropagation()}>
        {/* 左箭头 */}
        <button className="gallery-arrow gallery-arrow--left" onClick={goPrev} aria-label="上一张">
          ‹
        </button>

        {/* 卡牌 — key={current} 强制重建 DOM，防止快速切换时图片残留 */}
        <div
          className="gallery-card"
          key={current}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setFlipped((f) => !f)}
        >
          <div className={`gallery-card-inner${flipped ? ' is-flipped' : ''}`}>
            {/* 正面 */}
            <div className="gallery-face gallery-face--front">
              {!frontLoaded && <div className="gallery-skeleton" />}
              <img
                src={card.front_image}
                alt={`#${card.card_number}`}
                onLoad={() => setFrontLoaded(true)}
                style={{ opacity: frontLoaded ? 1 : 0 }}
              />
            </div>
            {/* 背面 */}
            <div className="gallery-face gallery-face--back">
              {!backLoaded && <div className="gallery-skeleton" />}
              <img
                src={card.back_thumb || card.back_image}
                alt={`#${card.card_number} 卡背`}
                onLoad={() => setBackLoaded(true)}
                style={{ opacity: backLoaded ? 1 : 0 }}
              />
            </div>
          </div>
        </div>

        {/* 右箭头 */}
        <button className="gallery-arrow gallery-arrow--right" onClick={goNext} aria-label="下一张">
          ›
        </button>
      </div>

      {/* ── 底部信息栏 ── */}
      <div className="gallery-bar" onClick={(e) => e.stopPropagation()}>
        <span className="gallery-number">#{card.card_number}</span>
        <span className="gallery-counter">
          {current + 1} / {valid.length}
        </span>
        <a
          className="gallery-download"
          href={card.front_image}
          download
          title="下载原图"
        >
          ⬇
        </a>
        <button className="gallery-flip-hint" onClick={() => setFlipped((f) => !f)}>
          {flipped ? '正面' : '背面'}
        </button>
      </div>
    </div>
  )
}
