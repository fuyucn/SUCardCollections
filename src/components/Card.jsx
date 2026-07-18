import { useState, useRef, useEffect, useCallback } from 'react'
import DeferredImage from './DeferredImage'
import './Card.css'

const FLIP_DURATION_MS = 600 // 与 CSS transition 一致

export default function Card({ card, flipAllKey = 0 }) {
  const [flipped, setFlipped] = useState(false)
  const [backVisible, setBackVisible] = useState(true)
  const flipTimerRef = useRef(null)
  const frontImgRef = useRef(null)
  const flippedRef = useRef(flipped)
  useEffect(() => { flippedRef.current = flipped }, [flipped])

  // 监听全局翻转信号：一键翻转所有卡到正面
  useEffect(() => {
    if (flipAllKey > 0 && !flippedRef.current && card.card_image) {
      clearFlipTimer()
      setFlipped(true)
      flipTimerRef.current = setTimeout(() => {
        flipTimerRef.current = null
        setBackVisible(false)
        frontImgRef.current?.trigger()
      }, FLIP_DURATION_MS)
    }
  }, [flipAllKey, card.card_image])

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
      <div className="card-wrapper is-empty" aria-label={`卡牌 #${card.card_number} — 空白`}>
        <div className="card-inner">
          <div className="card-face empty-face">
            <span className="empty-label">暂无</span>
          </div>
        </div>
        <div className="card-footer">
          <span className="card-number">#{card.card_number}</span>
        </div>
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
      // 翻到正面 → 等翻转动画完成后：隐藏背面 + 加载正面图片
      flipTimerRef.current = setTimeout(() => {
        flipTimerRef.current = null
        setBackVisible(false)
        frontImgRef.current?.trigger()
      }, FLIP_DURATION_MS)
    } else {
      // 翻回背面 → 立即显示背面
      setBackVisible(true)
    }
  }

  const hasFrontImage = !!card.front_image
  const hasBackImage = !!card.back_image

  // 缩略图优先，回退到原图
  const backSrc = card.back_thumb || card.back_image
  const frontSrc = card.front_thumb || card.front_image
  // 原图用于下载（仅正面）
  const frontDownload = card.front_image

  return (
    <div
      className="card-wrapper"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}
      aria-label={`卡牌 #${card.card_number} — 点击翻转`}
    >
      <div className={`card-inner${flipped ? ' is-flipped' : ''}`}>
        {/* ── Back face (visible by default, hidden via JS after flip completes) ── */}
        <div className={`card-face card-back${backVisible ? '' : ' back-hidden'}`}>
          {hasBackImage ? (
            <DeferredImage
              src={backSrc}
              alt="卡背"
              className="card-img"
              autoLoad
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
              src={frontSrc}
              alt={`卡牌 #${card.card_number} 正面`}
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
      <div className="card-footer">
        <span className="card-number">#{card.card_number}</span>
        {flipped && frontDownload && (
          <a
            className="card-download"
            href={frontDownload}
            download
            onClick={(e) => e.stopPropagation()}
            title="下载原图"
          >
            ⬇
          </a>
        )}
      </div>
    </div>
  )
}
