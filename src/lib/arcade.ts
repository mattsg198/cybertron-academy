import { WORD_PACKS, type WordEntry } from '../data/wordbank'
import type { SrsCard } from '../store/useGameStore'
import { epochDay } from '../store/useGameStore'

// ============================================================
// 竞技场(反应速度小游戏)共享逻辑。
// 取词优先"到期 + 错题"卡 → 玩即复习(把 SRS 藏进游戏)。
// ============================================================

export interface ArcadeGameDef {
  id: string
  name: string
  emoji: string
  desc: string
  ready: boolean
}

export const ARCADE_GAMES: ArcadeGameDef[] = [
  { id: 'blitz', name: '能量速配', emoji: '⚡', desc: '限时中英速配,连击翻倍', ready: true },
  { id: 'firewall', name: '语法防火墙', emoji: '🧱', desc: '句子对错,极速判断', ready: true },
  { id: 'sonic', name: '声波拦截', emoji: '📡', desc: '听音速点,反应越快越强', ready: true },
  { id: 'rain', name: '单词雨', emoji: '🌧️', desc: '落下的英文里接住对的那个', ready: true },
  { id: 'shooter', name: '飞机射击', emoji: '🚀', desc: '击落带目标词的敌机', ready: true },
]

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
export const pick = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n)

const ALL_WORDS = (): WordEntry[] => WORD_PACKS.flatMap((p) => p.words)

/** A play pool that puts due/錯題 words first, then fills with random ones. */
export function arcadeWords(srs: Record<string, SrsCard>, count = 40): WordEntry[] {
  const all = ALL_WORDS()
  const byWord = new Map(all.map((w) => [w.word, w]))
  const today = epochDay()
  const priority = Object.values(srs)
    .filter((c) => c.kind === 'word' && (c.collected || c.dueDay <= today))
    .sort((a, b) => Number(b.collected) - Number(a.collected) || a.dueDay - b.dueDay)
    .map((c) => byWord.get(c.ref))
    .filter((w): w is WordEntry => !!w)

  const seen = new Set(priority.map((w) => w.word))
  const filler = shuffle(all.filter((w) => !seen.has(w.word)))
  return [...priority, ...filler].slice(0, Math.max(count, priority.length))
}

/** Emoji-only words (for picture-based games like Sonic Intercept). */
export const arcadeEmojiWords = (srs: Record<string, SrsCard>, count = 40): WordEntry[] =>
  arcadeWords(srs, 200).filter((w) => w.emoji).slice(0, count)
