/**
 * GET /api/cards
 * Scans R2 bucket for actual card images, returns card list for #1–#50.
 * has_card is determined by whether the image file exists in R2.
 */
export async function onRequest(context) {
  const { env } = context

  try {
    const listed = await env.CARDS_BUCKET.list({ prefix: 'cards/' })
    const existing = new Set()

    const hasThumb = new Set()

    for (const obj of listed.objects) {
      // Full-size card: cards/001.png
      const match = obj.key.match(/^cards\/(\d{3})\.png$/i)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num >= 1 && num <= 50) {
          existing.add(num)
        }
      }
      // Thumbnail: cards/thumb/001.webp
      const thumbMatch = obj.key.match(/^cards\/thumb\/(\d{3})\.webp$/i)
      if (thumbMatch) {
        const num = parseInt(thumbMatch[1], 10)
        if (num >= 1 && num <= 50) {
          hasThumb.add(num)
        }
      }
    }

    function pad(n) {
      return String(n).padStart(3, '0')
    }

    const cards = Array.from({ length: 50 }, (_, i) => {
      const n = i + 1
      return {
        card_number: n,
        name: `Card #${n}`,
        has_card: existing.has(n),
        front_image: existing.has(n) ? `/api/images/${pad(n)}.png` : null,
        front_thumb: existing.has(n) ? (hasThumb.has(n) ? `/api/images/thumb/${pad(n)}.webp` : `/api/images/${pad(n)}.png`) : null,
        back_image: '/images/cards/back.png',
        back_thumb: '/images/cards/back-thumb.webp',
      }
    })

    return Response.json(cards, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  } catch (err) {
    return Response.json(
      { error: 'Failed to list cards', detail: err.message },
      { status: 500 }
    )
  }
}
