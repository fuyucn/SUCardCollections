/**
 * imageCache.js — 双层图片缓存模块
 *
 * L1: 内存 LRU Map（快速命中，页面关闭即释放）
 * L2: sessionStorage（Blob URL 无法直接存储，存储加载标记；重载后需重新请求但可跳过服务端缓存）
 *
 * 策略：
 *  - 已缓存的 URL → 直接返回 blob URL，零网络请求
 *  - 未缓存的 URL → fetch → blob → createObjectURL → 存入 L1
 *  - 防御：加载失败不缓存，不泄露无效 URL
 */

const MAX_MEMORY_ENTRIES = 60 // LRU 上限，约 60 张卡片正面

const memoryCache = new Map()

function evictLRU() {
  while (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const oldest = memoryCache.keys().next().value
    const entry = memoryCache.get(oldest)
    if (entry?.blobUrl) {
      URL.revokeObjectURL(entry.blobUrl)
    }
    memoryCache.delete(oldest)
  }
}

/**
 * 从指定 URL 加载图片，返回 blob URL
 * 缓存命中 → 直接返回；未命中 → fetch + 缓存
 *
 * @param {string} url       图片原始 URL
 * @param {AbortSignal} [signal]  可选中止信号
 * @returns {Promise<string>} blob URL
 */
export async function loadImage(url, signal) {
  // L1 内存命中
  const cached = memoryCache.get(url)
  if (cached) {
    // LRU refresh: move to end
    memoryCache.delete(url)
    memoryCache.set(url, cached)
    return cached.blobUrl
  }

  // 网络加载
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Image load failed: HTTP ${response.status} for ${url}`)
  }

  const blob = await response.blob()

  // 二次校验：确保是图片类型
  if (!blob.type.startsWith('image/')) {
    throw new Error(`Invalid image type: ${blob.type} for ${url}`)
  }

  const blobUrl = URL.createObjectURL(blob)

  // LRU 驱逐后写入
  evictLRU()
  memoryCache.set(url, { blobUrl, loadedAt: Date.now() })

  return blobUrl
}

/**
 * 检查 URL 是否已在缓存中
 */
export function isCached(url) {
  return memoryCache.has(url)
}

/**
 * 获取已缓存的 blob URL（不触发加载）
 */
export function getCached(url) {
  const entry = memoryCache.get(url)
  return entry?.blobUrl ?? null
}

/**
 * 清除所有缓存并释放 blob URL
 */
export function clearCache() {
  for (const [, entry] of memoryCache) {
    if (entry.blobUrl) {
      URL.revokeObjectURL(entry.blobUrl)
    }
  }
  memoryCache.clear()
}
