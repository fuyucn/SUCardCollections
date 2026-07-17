import { useState, useEffect } from 'react'
import CardGrid from './components/CardGrid'
import { fetchCards } from './api'

export default function App() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        <p>Loading cards...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p className="error">Failed to load: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  const ownedCount = cards.filter((c) => c.has_card).length
  const totalCount = cards.length

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">SuCards</h1>
        <p className="subtitle">Card Collection</p>
        <div className="stats">
          <span>
            已拥有 <strong>{ownedCount}</strong> / {totalCount}
          </span>
        </div>
      </header>
      <main>
        <CardGrid cards={cards} />
      </main>
      <footer className="footer">
        <p>SuCards Collection — Built with Cloudflare Pages</p>
      </footer>
    </div>
  )
}
