import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DeferredImage from './DeferredImage'
import './Card.css'

const FLIP_DURATION_MS = 600 // 与 CSS transition 一致

export default function Card({ card }) {
  const [flipped, setFlipped] = useState(false)
  const flipTimerRef = useRef(null)
  const frontImgRef = useRef(null)
  const backImgRef = useRef(null)
  const navigate = useNavigate()

  // 清理定时器
  const clearFlipTimer = useCallback(() => {
    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current)
      flipTimerRef.current = null
    }
  }, [])

  // ── Empty card ──
  if (!card.has_card) {
    return (
      <div className="card-wrapper is-empty" aria-label={`Card #${card.card_number} — empty`}>
        <div className="card-inner">
          <div className="card-face empty-face">
            <span className="empty-label">暂无</span>
          </div>
        </div>
        <span className="card-number">#{card.card_number}</span>
      </div>
    )
  }

  // ── Custom SuCard: click navigates to detail ──
  if (card.is_custom && card.custom_id) {
    const handleNavigate = () => navigate(`/card/${card.custom_id}`)
    return (
      <div
        className="card-wrapper"
        onClick={handleNavigate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleNavigate()
        }}
        aria-label={`Custom card: ${card.name} — click to view`}
      >
        <div className="card-inner">
          <div className="card-face card-front" style={{ transform: 'none' }}>
            {card.front_image ? (
              <img
                src={card.front_image}
                alt={card.name}
                className="card-img"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : null}
            <div className="card-placeholder">
              <span>#{card.card_number}</span>
            </div>
          </div>
        </div>
        <span className="card-number">#{card.card_number}</span>
      </div>
    )
  }

  // ── Actual card with deferred flip-to-load ──
  //
  // 流程：
  // 1. 点击 → 立即切换 flipped 状态（触发 CSS 翻转动画）
  // 2. 600ms 后动画完成 → 调用 DeferredImage.trigger() 加载图片
  // 3. 若 600ms 内再次点击（翻转未完成即翻回）→ 取消 timer，不加载
  // 4. 加载失败 → 保持占位，不暴露原始 URL
  // 5. 已加载过的面 → 缓存命中，不再请求

  const handleClick = () => {
    const willFlip = !flipped

    clearFlipTimer()

    // 立即更新翻转状态 → CSS 动画启动
    setFlipped(willFlip)

    if (willFlip) {
      // 翻到正面 → 等翻转动画完成后加载正面图片
      flipTimerRef.current = setTimeout(() => {
        flipTimerRef.current = null
        frontImgRef.current?.trigger()
      }, FLIP_DURATION_MS)
    } else {
      // 翻回背面 → 等翻转动画完成后加载背面图片
      flipTimerRef.current = setTimeout(() => {
        flipTimerRef.current = null
        backImgRef.current?.trigger()
      }, FLIP_DURATION_MS)
    }
  }

  const hasFrontImage = !!card.front_image
  const hasBackImage = !!card.back_image

  return (
    <div
      className="card-wrapper"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}
      aria-label={`Card #${card.card_number} — click to flip`}
    >
      <div className={`card-inner${flipped ? ' is-flipped' : ''}`}>
        {/* ── Back face (visible by default) ── */}
        <div className="card-face card-back">
          {hasBackImage ? (
            <DeferredImage
              ref={backImgRef}
              src={card.back_image}
              alt="Card Back"
              className="card-img"
              placeholder={
                <span className="deferred-placeholder-text">?</span>
              }
            />
          ) : (
            <div className="card-placeholder back-placeholder">
              <span>?</span>
            </div>
          )}
        </div>

        {/* ── Front face (hidden by default, shown after flip) ── */}
        <div className="card-face card-front">
          {hasFrontImage ? (
            <DeferredImage
              ref={frontImgRef}
              src={card.front_image}
              alt={`Card #${card.card_number} Front`}
              className="card-img"
              placeholder={
                <span className="deferred-placeholder-text">
                  #{card.card_number}
                </span>
              }
            />
          ) : (
            <div className="card-placeholder">
              <span>#{card.card_number}</span>
            </div>
          )}
        </div>
      </div>
      <span className="card-number">#{card.card_number}</span>
    </div>
  )
}
