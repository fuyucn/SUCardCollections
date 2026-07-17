import { useState, useEffect } from 'react'
import CardGrid from './components/CardGrid'
import Guide from './components/Guide'
import { fetchCards } from './api'

export default function App() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showGuide, setShowGuide] = useState(false)

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

  if (showGuide) {
    return <Guide onBack={() => setShowGuide(false)} />
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
        <button className="guide-btn" onClick={() => setShowGuide(true)}>
          如何制作
        </button>
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
