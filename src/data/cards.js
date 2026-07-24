/**
 * Static fallback card data for cards #1–#50.
 *
 * Image paths:
 *   - Front: /api/images/{xxx}.png  (three-digit padded, e.g. 001.png)
 *   - Back:  /images/cards/back.png
 */

const existingCardNumbers = new Set([
  1, 3, 4, 5, 7, 8, 10, 11, 13,
  15, 16, 17, 20, 21, 23, 25, 26, 28,
  30, 31, 33, 35, 37, 38, 40, 42, 44,
  45, 47, 48, 50,
])

function pad(n) {
  return String(n).padStart(3, '0')
}

export const defaultCards = Array.from({ length: 50 }, (_, i) => {
  const n = i + 1
  return {
    card_number: n,
    name: `Card #${n}`,
    has_card: existingCardNumbers.has(n),
    front_image: existingCardNumbers.has(n) ? `/api/images/${pad(n)}.png` : null,
    front_thumb: existingCardNumbers.has(n) ? `/api/images/${pad(n)}.png` : null,
    back_image: '/images/cards/back.png',
    back_thumb: '/images/cards/back-thumb.webp',
  }
})

