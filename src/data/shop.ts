// ============================================================
// 能量商店 — 让 energon 有消耗出口(闭环动机)。
// 只卖外观皮肤 + 小道具;真实布鲁可盲盒仍只由 KET 银牌解锁,绝不进商店。
// ============================================================

export const SHIELD_COST = 120 // 连击护盾单价
export const SHIELD_MAX = 5

export interface ThemeItem {
  id: string
  name: string
  zh: string
  cost: number
  emoji: string
  bg: string // 页面背景渐变
}

export const THEMES: ThemeItem[] = [
  { id: 'default', name: 'Cyber Night', zh: '赛博夜', cost: 0, emoji: '🌃', bg: 'linear-gradient(180deg,#0a0f2c,#141c46)' },
  { id: 'flame', name: 'Inferno', zh: '烈焰红', cost: 300, emoji: '🔥', bg: 'linear-gradient(180deg,#240a12,#451423)' },
  { id: 'aurora', name: 'Aurora', zh: '极光绿', cost: 300, emoji: '🌌', bg: 'linear-gradient(180deg,#06241f,#0a4634)' },
  { id: 'gold', name: 'Gold Energon', zh: '黄金能量', cost: 600, emoji: '⚡', bg: 'linear-gradient(180deg,#241d06,#463a14)' },
]

export const themeById = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0]
