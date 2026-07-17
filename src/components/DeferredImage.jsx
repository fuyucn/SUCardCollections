import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { loadImage, getCached } from '../imageCache'

/**
 * DeferredImage — 延迟加载图片组件
 *
 * 核心机制：
 * 1. 初始渲染：不设置 <img src>，仅显示占位符，零网络请求
 * 2. 通过 ref.trigger() 显式触发加载
 * 3. 加载中显示 loading 状态
 * 4. 加载完成 → 渲染 blob URL
 * 5. 加载失败 → 保持占位，不泄露原始 URL
 * 6. 支持 AbortController 中途取消
 *
 * 使用方式：
 *   const imgRef = useRef(null)
 *   <DeferredImage ref={imgRef} src="..." />
 *   imgRef.current?.trigger()  // 触发加载
 */

const STATE = {
  IDLE: 'idle',         // 未触发，占位中
  LOADING: 'loading',   // 加载中
  LOADED: 'loaded',     // 成功
  ERROR: 'error',       // 失败，保持占位
}

const DeferredImage = forwardRef(function DeferredImage({
  src,              // 真实图片 URL
  alt = '',
  className = '',
  placeholder,      // 自定义占位内容 (ReactNode)
  autoLoad = false, // 挂载时自动加载（不等待 trigger）
  onLoad,           // 加载成功回调
  onError,          // 加载失败回调
}, ref) {
  const [state, setState] = useState(() => {
    if (src && getCached(src)) return STATE.LOADED
    return STATE.IDLE
  })
  const [blobUrl, setBlobUrl] = useState(() => getCached(src) ?? null)
  const abortRef = useRef(null)
  const mountedRef = useRef(true)
  const stateRef = useRef(state)

  // 保持 stateRef 同步（避免 trigger 中的闭包问题）
  stateRef.current = state

  // 组件卸载时取消请求
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
    }
  }, [])

  const trigger = useCallback(async () => {
    if (!src) return
    const currentState = stateRef.current
    if (currentState === STATE.LOADING || currentState === STATE.LOADED) return

    // 检查缓存
    const cached = getCached(src)
    if (cached) {
      if (mountedRef.current) {
        setBlobUrl(cached)
        setState(STATE.LOADED)
        onLoad?.()
      }
      return
    }

    // 取消之前的请求
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setState(STATE.LOADING)

    try {
      const url = await loadImage(src, controller.signal)
      if (!mountedRef.current) return
      setBlobUrl(url)
      setState(STATE.LOADED)
      onLoad?.()
    } catch (err) {
      if (err.name === 'AbortError') {
        // 被取消，回到 IDLE（可重新触发）
        if (mountedRef.current) setState(STATE.IDLE)
        return
      }
      if (!mountedRef.current) return
      console.warn(`DeferredImage: failed to load "${src}"`, err.message)
      setState(STATE.ERROR)
      onError?.(err)
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }, [src, onLoad, onError])

  // 暴露 trigger 方法给父组件
  useImperativeHandle(ref, () => ({ trigger }), [trigger])

  // 当 src 变化时重置（必须写在 autoLoad 之前，否则会 abort 掉 autoLoad 的 fetch）
  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    const cached = src ? getCached(src) : null
    setState(cached ? STATE.LOADED : STATE.IDLE)
    setBlobUrl(cached ?? null)
  }, [src])

  // autoLoad：挂载时自动触发加载（如卡背图）
  useEffect(() => {
    if (autoLoad && src) {
      trigger()
    }
  }, [autoLoad, src, trigger])

  const showPlaceholder =
    state === STATE.IDLE || state === STATE.LOADING || state === STATE.ERROR

  return (
    <>
      {/* 占位层 */}
      {showPlaceholder && (
        <div className={`deferred-placeholder ${state === STATE.LOADING ? 'is-loading' : ''}`}>
          {placeholder || (
            <span className="deferred-placeholder-text">
              {state === STATE.LOADING ? '···' : '?'}
            </span>
          )}
        </div>
      )}

      {/* 图片层：仅加载成功渲染 */}
      {state === STATE.LOADED && blobUrl && (
        <img
          src={blobUrl}
          alt={alt}
          className={className}
        />
      )}
    </>
  )
})

export { STATE as DeferredState }
export default DeferredImage
