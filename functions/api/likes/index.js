/**
 * GET /api/likes
 * Returns all like counts: { "card_number": count, ... }
 * Only includes cards that have at least 1 like.
 */
export async function onRequest(context) {
  const { env } = context

  try {
    // If KV not configured yet, return empty
    if (!env.SUCARDS_LIKES_KV) {
      return Response.json({}, {
        headers: { 'Cache-Control': 'public, max-age=30' },
      })
    }

    // List all like count keys
    const listed = await env.SUCARDS_LIKES_KV.list({ prefix: 'likes:' })
    const result = {}

    for (const key of listed.keys) {
      const num = key.name.split(':')[1]
      const count = await env.SUCARDS_LIKES_KV.get(key.name)
      if (count && parseInt(count) > 0) {
        result[num] = parseInt(count)
      }
    }

    return Response.json(result, {
      headers: { 'Cache-Control': 'public, max-age=30' },
    })
  } catch (err) {
    return Response.json({}, {
      headers: { 'Cache-Control': 'public, max-age=10' },
    })
  }
}
