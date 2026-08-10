/**
 * POST /api/upload
 * Upload a card image to R2. Requires password in x-upload-password header.
 * Body (两种方式二选一):
 *   1. multipart/form-data  with "file" (image) and "number" (11-999)
 *   2. application/json     with "url" (图片直链) and "number" (11-999)
 * Env var: UPLOAD_PASSWORD
 * Will NOT overwrite an existing card image. Cards 1-10 are protected.
 */
import { getPassword } from '../_utils/password'

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp']

export async function onRequest(context) {
  const { request, env } = context

  // ── CORS preflight ──
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'x-upload-password, content-type',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // ── Password check ──
  const password = request.headers.get('x-upload-password')
  const expected = await getPassword(env)

  if (!expected) {
    return Response.json({ error: 'Server not configured' }, { status: 500 })
  }

  if (!password || password !== expected) {
    return Response.json({ error: '密码错误' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') || ''

  // ── Parse body: multipart (file) OR json (url) ──
  let file = null
  let numberStr = null
  let contentTypeOut = 'image/png'

  if (contentType.includes('multipart/form-data')) {
    let formData
    try {
      formData = await request.formData()
    } catch {
      return Response.json({ error: '无效的表单数据' }, { status: 400 })
    }
    file = formData.get('file')
    numberStr = formData.get('number')

    if (!(file instanceof File)) {
      return Response.json({ error: '文件格式无效' }, { status: 400 })
    }
    contentTypeOut = file.type
  } else if (contentType.includes('application/json')) {
    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: '无效的 JSON 数据' }, { status: 400 })
    }
    const url = body.url
    numberStr = String(body.number ?? '')

    if (!url) {
      return Response.json({ error: '缺少文件或卡号' }, { status: 400 })
    }

    // ── Fetch image from remote URL ──
    let parsed
    try {
      parsed = new URL(url)
    } catch {
      return Response.json({ error: 'URL 格式无效' }, { status: 400 })
    }
    // 只允许 http/https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return Response.json({ error: '仅支持 http/https 图片链接' }, { status: 400 })
    }

    let remote
    try {
      remote = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'SuCards-Uploader/1.0' },
      })
    } catch (err) {
      return Response.json({ error: '无法访问该图片链接', detail: err.message }, { status: 400 })
    }

    if (!remote.ok) {
      return Response.json(
        { error: `图片下载失败 (HTTP ${remote.status})`, detail: remote.statusText },
        { status: 400 }
      )
    }

    const remoteType = remote.headers.get('content-type') || ''
    if (!ALLOWED.includes(remoteType)) {
      // 某些站点不返回 content-type 或返回通用类型，尝试从 content-type 判断
      if (!remoteType.includes('image')) {
        return Response.json(
          { error: `远程资源不是图片 (content-type: ${remoteType || '未知'})` },
          { status: 400 }
        )
      }
      // 允许通用的 image/* 或 octet-stream
      if (remoteType.includes('png')) contentTypeOut = 'image/png'
      else if (remoteType.includes('jpeg') || remoteType.includes('jpg')) contentTypeOut = 'image/jpeg'
      else if (remoteType.includes('webp')) contentTypeOut = 'image/webp'
      else contentTypeOut = 'image/png'
    } else {
      contentTypeOut = remoteType
    }

    // 限制下载大小（50MB），防止超大资源耗尽内存
    const MAX_BYTES = 50 * 1024 * 1024
    const cl = parseInt(remote.headers.get('content-length') || '0', 10)
    if (cl && cl > MAX_BYTES) {
      return Response.json({ error: '图片超过 50MB 大小限制' }, { status: 400 })
    }

    let buf
    try {
      buf = await remote.arrayBuffer()
    } catch (err) {
      return Response.json({ error: '读取图片数据失败', detail: err.message }, { status: 400 })
    }
    if (buf.byteLength === 0) {
      return Response.json({ error: '图片数据为空' }, { status: 400 })
    }
    if (buf.byteLength > MAX_BYTES) {
      return Response.json({ error: '图片超过 50MB 大小限制' }, { status: 400 })
    }
    file = new Blob([buf], { type: contentTypeOut })
  } else {
    return Response.json({ error: '不支持的请求格式，请使用 multipart 或 JSON' }, { status: 400 })
  }

  if (!numberStr) {
    return Response.json({ error: '缺少文件或卡号' }, { status: 400 })
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
  if (!ALLOWED.includes(contentTypeOut)) {
    return Response.json(
      { error: `不支持的文件类型: ${contentTypeOut}，仅支持 PNG/JPEG/WebP` },
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
      httpMetadata: { contentType: contentTypeOut },
    })

    return Response.json(
      { success: true, card_number: num, key },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'x-upload-password, content-type',
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
