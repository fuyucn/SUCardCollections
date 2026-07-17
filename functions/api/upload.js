/**
 * POST /api/upload
 * Upload a card image to R2. Requires password in x-upload-password header.
 * Body: multipart/form-data with "file" (image) and "number" (11-999).
 * Env var: UPLOAD_PASSWORD
 * Will NOT overwrite an existing card image. Cards 1-10 are protected.
 */
export async function onRequest(context) {
  const { request, env } = context

  // ── CORS preflight ──
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'x-upload-password',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // ── Password check ──
  const password = request.headers.get('x-upload-password')
  const expected = env.UPLOAD_PASSWORD

  if (!expected) {
    return Response.json({ error: 'Server not configured' }, { status: 500 })
  }

  if (!password || password !== expected) {
    return Response.json({ error: '密码错误' }, { status: 401 })
  }

  // ── Parse form ──
  let formData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: '无效的表单数据' }, { status: 400 })
  }

  const file = formData.get('file')
  const numberStr = formData.get('number')

  if (!file || !numberStr) {
    return Response.json({ error: '缺少文件或卡号' }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return Response.json({ error: '文件格式无效' }, { status: 400 })
  }

  const num = parseInt(numberStr, 10)
  if (isNaN(num) || num < 11 || num > 999) {
    return Response.json({ error: '卡号必须在 11-999 之间' }, { status: 400 })
  }

  // ── Protect first 10 cards ──
  if (num >= 1 && num <= 10) {
    return Response.json(
      { error: '前 10 张卡面（001-010）不允许上传修改' },
      { status: 403 }
    )
  }

  // ── Validate file type ──
  const allowed = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowed.includes(file.type)) {
    return Response.json(
      { error: `不支持的文件类型: ${file.type}，仅支持 PNG/JPEG/WebP` },
      { status: 400 }
    )
  }

  // ── Check if card already exists ──
  const key = `cards/${String(num).padStart(3, '0')}.png`

  try {
    const existing = await env.CARDS_BUCKET.get(key)
    if (existing) {
      return Response.json(
        { error: `卡号 #${num}（${key}）已存在，不能覆盖已有卡面。请选择其他编号或先手动删除。` },
        { status: 409 }
      )
    }
  } catch (err) {
    return Response.json(
      { error: '检查已有卡面失败', detail: err.message },
      { status: 500 }
    )
  }

  // ── Upload to R2 ──
  try {
    await env.CARDS_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: 'image/png' },
    })

    return Response.json(
      { success: true, card_number: num, key },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'x-upload-password',
        },
      }
    )
  } catch (err) {
    return Response.json(
      { error: '上传失败', detail: err.message },
      { status: 500 }
    )
  }
}
