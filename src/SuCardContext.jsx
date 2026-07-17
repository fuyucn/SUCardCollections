import { createContext, useContext, useState, useEffect, useCallback } from 'react'

/**
 * SuCard 数据结构
 *
 * @typedef {Object} SuCard
 * @property {string}   id          — 唯一标识 (UUID)
 * @property {string}   name        — 卡片名称
 * @property {string}   character   — 角色名
 * @property {string}   number      — 编号 (如 "007")
 * @property {string}   rarity      — 稀有度: "N" | "R" | "SR" | "SSR"
 * @property {string}   type        — 卡片类型: "portrait" | "scene"
 * @property {string}   description — 描述/故事文本
 * @property {string}   imageUrl    — 卡片正面图片 URL (data URL 或远程地址)
 * @property {string}   createdAt   — ISO 8601 创建时间
 */

const STORAGE_KEY = 'sucards_custom'

function loadCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

const SuCardContext = createContext(null)

export function SuCardProvider({ children }) {
  const [customCards, setCustomCards] = useState(loadCards)

  // 持久化到 localStorage
  useEffect(() => {
    saveCards(customCards)
  }, [customCards])

  const addCard = useCallback((card) => {
    setCustomCards((prev) => [card, ...prev])
  }, [])

  const removeCard = useCallback((id) => {
    setCustomCards((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const getCard = useCallback(
    (id) => customCards.find((c) => c.id === id) || null,
    [customCards],
  )

  const value = {
    customCards,
    addCard,
    removeCard,
    getCard,
  }

  return (
    <SuCardContext.Provider value={value}>{children}</SuCardContext.Provider>
  )
}

export function useSuCards() {
  const ctx = useContext(SuCardContext)
  if (!ctx) throw new Error('useSuCards must be used within SuCardProvider')
  return ctx
}
