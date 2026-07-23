/**
 * GET /api/cards
 * Scans R2 bucket for actual card images.
 * #1–#50: always shown (with placeholder for missing).
 * #51–#999: only shown if card actually exists in R2.
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
        if (num >= 1 && num <= 999) {
          existing.add(num)
        }
      }
      // Thumbnail: cards/thumb/001.webp
      const thumbMatch = obj.key.match(/^cards\/thumb\/(\d{3})\.webp$/i)
      if (thumbMatch) {
        const num = parseInt(thumbMatch[1], 10)
        if (num >= 1 && num <= 999) {
          hasThumb.add(num)
        }
      }
    }

    function pad(n) {
      return String(n).padStart(3, '0')
    }

    function makeCard(n) {
      return {
        card_number: n,
        name: `Card #${n}`,
        has_card: existing.has(n),
        front_image: existing.has(n) ? `/api/images/${pad(n)}.png` : null,
        front_thumb: existing.has(n) ? (hasThumb.has(n) ? `/api/images/thumb/${pad(n)}.webp` : `/api/images/${pad(n)}.png`) : null,
        back_image: '/images/cards/back.png',
        back_thumb: '/images/cards/back-thumb.webp',
      }
    }

    // #1–#50: always shown with placeholders
    const cards = Array.from({ length: 50 }, (_, i) => makeCard(i + 1))

    // #51–#999: only shown if card actually exists in R2
    const extras = Array.from(existing)
      .filter(n => n > 50)
      .sort((a, b) => a - b)
      .map(makeCard)

    const all = cards.concat(extras)

    // Always include special download cards (static assets, not in R2)
    all.push({
      card_number: 0,
      name: '卡面1',
      has_card: true,
      front_image: '/images/cards/sucard-000.png',
      front_thumb: '/images/cards/sucard-000-thumb.webp',
      back_image: '/images/cards/back.png',
      back_thumb: '/images/cards/back-thumb.webp',
    })

    all.push({
      card_number: 999,
      name: '卡面2',
      has_card: true,
      front_image: '/images/cards/sucard-special.png',
      front_thumb: '/images/cards/sucard-special-thumb.webp',
      back_image: '/images/cards/back.png',
      back_thumb: '/images/cards/back-thumb.webp',
    })

    return Response.json(all, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  } catch (err) {
    return Response.json(
      { error: 'Failed to list cards', detail: err.message },
      { status: 500 }
    )
  }
}
