import Card from './Card'
import './CardGrid.css'

export default function CardGrid({ cards, flipAllKey, likesMap = {}, onLike }) {
  return (
    <div className="card-grid">
      {cards.map((card) => (
        <Card key={card.card_number} card={card} flipAllKey={flipAllKey} likes={likesMap[card.card_number] || 0} onLike={onLike} />
      ))}
    </div>
  )
}
