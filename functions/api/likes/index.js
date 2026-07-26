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
        headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
      })
    }

    // List all like count keys (paginate through all if needed)
    const result = {}
    let cursor
    do {
      const listed = await env.SUCARDS_LIKES_KV.list({ prefix: 'likes:', cursor })
      // Parallelize all KV reads instead of sequential await
      const reads = listed.keys.map(key =>
        env.SUCARDS_LIKES_KV.get(key.name).then(count => {
          const num = key.name.split(':')[1]
          if (count && parseInt(count, 10) > 0) {
            result[num] = parseInt(count, 10)
          }
        })
      )
      await Promise.all(reads)
      cursor = listed.list_complete ? undefined : listed.cursor
    } while (cursor)

    return Response.json(result, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
    })
  } catch (err) {
    return Response.json({}, {
      headers: { 'Cache-Control': 'public, max-age=10' },
    })
  }
}
