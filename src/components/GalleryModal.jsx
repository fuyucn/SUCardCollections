import { useState, useEffect, useCallback, useRef } from 'react'
import DeferredImage from './DeferredImage'
import './GalleryModal.css'

const SWIPE_THRESHOLD = 50

export default function GalleryModal({ cards, initialIndex = 0, onClose }) {
  const valid = cards.filter((c) => c.has_card)
  const [current, setCurrent] = useState(() => {
    if (initialIndex >= 0 && initialIndex < valid.length) return initialIndex
    return 0
  })
  const [flipped, setFlipped] = useState(false)
  // 滑动动画状态
  const [swipeDir, setSwipeDir] = useState(null)   // 'left' | 'right' | null
  const [swipeOffset, setSwipeOffset] = useState(0)  // px

  // ── 翻页 ──
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
  const touchRef = useRef({ startX: 0, startY: 0, isSwipe: false })
  const onTouchStart = (e) => {
    touchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      isSwipe: false,
    }
    setSwipeOffset(0)
    setSwipeDir(null)
  }
  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchRef.current.startX
    const dy = e.touches[0].clientY - touchRef.current.startY
    // 横向滑动才拦截
    if (!touchRef.current.isSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      touchRef.current.isSwipe = true
    }
    if (touchRef.current.isSwipe) {
      setSwipeOffset(dx)
      setSwipeDir(dx > 0 ? 'right' : dx < 0 ? 'left' : null)
    }
  }
  const onTouchEnd = () => {
    if (!touchRef.current.isSwipe) {
      setSwipeOffset(0)
      setSwipeDir(null)
      return
    }
    if (swipeOffset > SWIPE_THRESHOLD) {
      goPrev()
    } else if (swipeOffset < -SWIPE_THRESHOLD) {
      goNext()
    }
    setSwipeOffset(0)
    setSwipeDir(null)
  }

  // ── 点击左右区域切换 ──
  const handleTapZone = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const w = rect.width
    if (x < w * 0.25) goPrev()
    else if (x > w * 0.75) goNext()
    else setFlipped((f) => !f)
  }

  const card = valid[current]
  if (!card) {
    return (
      <div className="gallery-overlay" onClick={onClose}>
        <div className="gallery-empty">暂无可展示的卡牌</div>
      </div>
    )
  }

  const backSrc = card.back_thumb || card.back_image
  const frontSrc = card.front_thumb || card.front_image

  // 卡片滑动偏移样式
  const swipeStyle = swipeDir
    ? {
        transform: `translateX(${swipeOffset}px)`,
        transition: 'none',
      }
    : { transition: 'transform 0.3s ease-out' }

  return (
    <div className="gallery-overlay" onClick={onClose}>
      {/* ── 关闭按钮 ── */}
      <button className="gallery-close" onClick={onClose} aria-label="关闭">
        ✕
      </button>

      {/* ── 卡牌区域（全屏） ── */}
      <div
        className="gallery-card-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={swipeStyle}
      >
        {/* 左点击区域 */}
        <div className="gallery-tap-zone gallery-tap-zone--left" onClick={(e) => { e.stopPropagation(); goPrev() }} />
        {/* 右点击区域 */}
        <div className="gallery-tap-zone gallery-tap-zone--right" onClick={(e) => { e.stopPropagation(); goNext() }} />

        {/* 卡牌 — key={current} 强制重建 */}
        <div
          className="gallery-card"
          key={current}
          onClick={handleTapZone}
        >
          <div className={`gallery-card-inner${flipped ? ' is-flipped' : ''}`}>
            {/* 正面 */}
            <div className="gallery-face gallery-face--front">
              <DeferredImage
                src={frontSrc}
                alt={`#${card.card_number}`}
                className="gallery-img"
                autoLoad
                placeholder={
                  <span className="deferred-placeholder-text">
                    #{card.card_number}
                  </span>
                }
              />
            </div>
            {/* 背面 */}
            <div className="gallery-face gallery-face--back">
              <DeferredImage
                src={backSrc}
                alt={`#${card.card_number} 卡背`}
                className="gallery-img"
                autoLoad
                placeholder={
                  <span className="deferred-placeholder-text">?</span>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 左右箭头（desktop 可见） ── */}
      <button className="gallery-arrow gallery-arrow--left" onClick={(e) => { e.stopPropagation(); goPrev() }} aria-label="上一张">
        ‹
      </button>
      <button className="gallery-arrow gallery-arrow--right" onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="下一张">
        ›
      </button>

      {/* ── 底部信息栏（desktop: overlay底部 / mobile: 固定底部） ── */}
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
