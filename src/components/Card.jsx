import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Card.css'

export default function Card({ card }) {
  const [flipped, setFlipped] = useState(false)
  const navigate = useNavigate()

  // ── Empty card (greyed out, not interactive) ──
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

  // ── Custom SuCard: click navigates to detail page ──
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

  // ── Actual card with flip interaction ──
  const handleClick = () => setFlipped((prev) => !prev)

  return (
    <div className="card-wrapper" onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      aria-label={`Card #${card.card_number} — click to flip`}
    >
      <div className={`card-inner${flipped ? ' is-flipped' : ''}`}>
        {/* Back face (visible by default) */}
        <div className="card-face card-back">
          {card.back_image ? (
            <img
              src={card.back_image}
              alt="Card Back"
              className="card-img"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : null}
          <div className="card-placeholder back-placeholder">
            <span>?</span>
          </div>
        </div>

        {/* Front face (hidden by default, shown after flip) */}
        <div className="card-face card-front">
          {card.front_image ? (
            <img
              src={card.front_image}
              alt={`Card #${card.card_number} Front`}
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
