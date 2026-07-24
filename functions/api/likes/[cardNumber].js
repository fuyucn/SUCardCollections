/**
 * POST /api/likes/:cardNumber
 * Increments like count for a card.
 * Deduplicates by client IP — one IP can only like a card once.
 *
 * Response: { success: true, likes: number } or { success: false, reason: "already_voted" }
 */
export async function onRequest(context) {
  const { env, request } = context
  const { cardNumber } = /** @type {{ cardNumber: string }} */ (context.params)

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  // Validate cardNumber is a number
  const num = parseInt(cardNumber, 10)
  if (isNaN(num) || num < 1 || num > 999) {
    return Response.json({ error: 'Invalid card number' }, { status: 400 })
  }

  if (!env.LIKES_KV) {
    return Response.json({ success: false, reason: 'KV not configured' }, { status: 503 })
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'

  try {
    // Check if this IP already liked this card
    const votedKey = `likes:voted:${num}:${ip}`
    const alreadyVoted = await env.LIKES_KV.get(votedKey)

    if (alreadyVoted) {
      const currentLikes = parseInt(await env.LIKES_KV.get(`likes:${num}`)) || 0
      return Response.json({ success: false, reason: 'already_voted', likes: currentLikes })
    }

    // Increment like count
    const likeKey = `likes:${num}`
    const currentCount = parseInt(await env.LIKES_KV.get(likeKey)) || 0
    const newCount = currentCount + 1

    await env.LIKES_KV.put(likeKey, String(newCount))
    await env.LIKES_KV.put(votedKey, '1')

    return Response.json({ success: true, likes: newCount })
  } catch (err) {
    return Response.json({ error: 'Failed to update like', detail: err.message }, { status: 500 })
  }
}
