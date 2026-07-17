/**
 * Static fallback card data for cards #0–#50.
 *
 * Modify `existingCardNumbers` to match your actual collection.
 * Cards not in this set will show as greyed-out, non-flippable placeholders.
 *
 * Image paths:
 *   - Front: /api/images/{xxx}.png  (three-digit padded, e.g. 001.png)
 *   - Back:  /images/cards/back.png
 */

const existingCardNumbers = new Set([
  0, 1, 3, 4, 5, 7, 8, 10, 11, 13,
  15, 16, 17, 20, 21, 23, 25, 26, 28,
  30, 31, 33, 35, 37, 38, 40, 42, 44,
  45, 47, 48, 50,
])

function pad(n) {
  return String(n).padStart(3, '0')
}

export const defaultCards = Array.from({ length: 51 }, (_, i) => ({
  card_number: i,
  name: `Card #${i}`,
  has_card: existingCardNumbers.has(i),
  front_image: existingCardNumbers.has(i) ? `/api/images/${pad(i)}.png` : null,
  back_image: '/images/cards/back.png',
}))
