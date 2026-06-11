// ============================================================
// 虚拟每日学习榜 —— 原创 AI 学员(非真人/非 IP 角色)每天"上线"和孩子比当日积分。
// 分数按日期确定性生成 + 随当天时间推进(早上低、傍晚高),营造"实时比赛"感。
// 孩子的分数 = 今日获得能量(energonToday)。
// ============================================================

export interface Student {
  id: string
  name: string
  emoji: string
  pace: number // 实力系数,越大目标分越高
  cheer: string // 落后于你时说的话
  taunt: string // 领先你时说的话
}

// 赛博坦学院的 AI 同学(原创)
export const AI_STUDENTS: Student[] = [
  { id: 'nova', name: 'Nova', emoji: '🌟', pace: 1.4, cheer: '哇,你冲得好快!', taunt: '我可是学霸,加把劲哦~' },
  { id: 'volt', name: 'Volt', emoji: '⚡', pace: 1.1, cheer: '别想甩开我!', taunt: '我又超上来啦!' },
  { id: 'sparky', name: 'Sparky', emoji: '✨', pace: 1.0, cheer: '你好厉害呀!', taunt: '嘿嘿,我领先咯~' },
  { id: 'cog', name: 'Cog', emoji: '⚙️', pace: 0.9, cheer: '稳住,我们继续!', taunt: '慢慢来也能赢哦。' },
  { id: 'rusty', name: 'Rusty', emoji: '🔩', pace: 0.7, cheer: '等等我呀!', taunt: '今天我状态不错!' },
]

const BASE = 45

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const smooth = (x: number) => x * x * (3 - 2 * x)

/** 当天已过去的"活跃时段"比例(7:00–21:00)。 */
function dayProgress(now = new Date()): number {
  const mins = now.getHours() * 60 + now.getMinutes()
  return Math.max(0, Math.min(1, (mins - 7 * 60) / (14 * 60)))
}

export interface BoardRow {
  id: string
  name: string
  emoji: string
  score: number
  you: boolean
  student?: Student
}

/** 生成今日排行榜(含孩子),按分数降序。 */
export function dailyBoard(childScore: number, now = new Date()): BoardRow[] {
  const dayKey = now.toISOString().slice(0, 10)
  const frac = smooth(dayProgress(now))
  const rows: BoardRow[] = AI_STUDENTS.map((s) => {
    const rng = mulberry32(hashStr(dayKey + s.id))
    const target = Math.round(BASE * s.pace * (0.75 + rng() * 0.5))
    return { id: s.id, name: s.name, emoji: s.emoji, score: Math.round(target * frac), you: false, student: s }
  })
  rows.push({ id: 'you', name: '你', emoji: '🕵️', score: childScore, you: true })
  rows.sort((a, b) => b.score - a.score || (a.you ? -1 : 1))
  return rows
}

export const rankOf = (board: BoardRow[]) => board.findIndex((r) => r.you) + 1
