/**
 * GET /api/verify
 * Verify upload password without performing any action.
 * Header: x-upload-password
 * Returns 200 if valid, 401 if wrong.
 */
export async function onRequest(context) {
  const { request, env } = context

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const password = request.headers.get('x-upload-password')
  const expected = env.UPLOAD_PASSWORD

  if (!expected) {
    return Response.json({ error: 'Server not configured' }, { status: 500 })
  }

  if (!password || password !== expected) {
    return Response.json({ error: '密码错误' }, { status: 401 })
  }

  return Response.json({ ok: true })
}
