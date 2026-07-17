import { defaultCards } from './data/cards'

/**
 * Production: fetches /api/cards which scans R2 for actual images.
 * Dev fallback: uses static data from data/cards.js
 */
export async function fetchCards() {
  try {
    const res = await fetch('/api/cards')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    // Local dev or API unavailable — fallback to static list
    return defaultCards
  }
}
