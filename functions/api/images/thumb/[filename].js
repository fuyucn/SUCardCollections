/**
 * GET /api/images/thumb/{filename}
 * Serves thumbnail versions from R2: cards/thumb/{filename}
 */
export async function onRequest(context) {
  const { request, env } = context
  const { pathname } = new URL(request.url)

  const filename = pathname.replace('/api/images/thumb/', '')
  if (!filename) {
    return new Response('Missing filename', { status: 400 })
  }

  // Try thumbnail first
  const thumbKey = `cards/thumb/${filename}`
  const object = await env.CARDS_BUCKET.get(thumbKey)
  if (!object) {
    // Fallback: try full-size
    const fullKey = `cards/${filename}`
    const fullObject = await env.CARDS_BUCKET.get(fullKey)
    if (!fullObject) {
      return new Response('Not found', { status: 404 })
    }
    const headers = new Headers()
    fullObject.writeHttpMetadata(headers)
    headers.set('Cache-Control', 'public, max-age=86400')
    return new Response(fullObject.body, { headers })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new Response(object.body, { headers })
}
