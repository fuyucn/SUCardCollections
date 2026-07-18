import Card from './Card'
import './CardGrid.css'

export default function CardGrid({ cards, flipAllKey }) {
  return (
    <div className="card-grid">
      {cards.map((card) => (
        <Card key={card.card_number} card={card} flipAllKey={flipAllKey} />
      ))}
    </div>
  )
}
