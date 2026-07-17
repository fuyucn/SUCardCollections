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

    for (const obj of listed.objects) {
      const match = obj.key.match(/^cards\/(\d{3})\.png$/i)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num >= 1 && num <= 50) {
          existing.add(num)
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
        back_image: '/images/cards/back.png',
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
