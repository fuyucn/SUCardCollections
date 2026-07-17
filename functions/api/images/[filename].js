/**
 * Proxy R2 bucket reads — only our Pages app can access.
 * GET /api/images/{filename} → reads from R2 sucards-images/cards/
 */
export async function onRequest(context) {
  const { request, env } = context
  const { pathname } = new URL(request.url)

  const filename = pathname.replace('/api/images/', '')
  if (!filename) {
    return new Response('Missing filename', { status: 400 })
  }

  const key = `cards/${filename}`
  const object = await env.CARDS_BUCKET.get(key)
  if (!object) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new Response(object.body, { headers })
}
