import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SrsRef } from '../types'
import { CURRICULUM, lessonOrder, unitById } from '../data/curriculum'
import { SHIELD_COST, SHIELD_MAX } from '../data/shop'

export interface Voucher {
  lessonId: string
  tier: 'silver' | 'gold'
  redeemed?: boolean // 家长已发放实体盲盒
}

const todayStr = () => new Date().toISOString().slice(0, 10)
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)

// Advance the streak for today's first activity. A 连击护盾 covers a missed day
// so the streak survives instead of resetting (Duolingo-style streak freeze).
function advanceStreak(
  last: string | null,
  today: string,
  streak: number,
  shields: number,
): { streak: number; shields: number } {
  if (!last) return { streak: 1, shields }
  if (last === today) return { streak, shields }
  const gap = dayDiff(last, today)
  if (gap === 1) return { streak: streak + 1, shields } // consecutive day
  const missed = gap - 1
  if (gap > 1 && shields >= missed) return { streak: streak + 1, shields: shields - missed }
  return { streak: 1, shields } // broke (not enough shields)
}

// 打卡连续里程碑（奖励为能量，不发盲盒券——盲盒仅由 KET 银牌解锁）
export interface Milestone {
  days: number
  bonus: number
  label: string
  emoji: string
}
export const STREAK_MILESTONES: Milestone[] = [
  { days: 3, bonus: 30, label: '坚持 3 天', emoji: '🔥' },
  { days: 7, bonus: 80, label: '坚持 1 周', emoji: '⭐' },
  { days: 14, bonus: 150, label: '坚持 2 周', emoji: '🚀' },
  { days: 30, bonus: 400, label: '坚持 1 个月', emoji: '🏆' },
  { days: 60, bonus: 800, label: '坚持 2 个月', emoji: '👑' },
]
/** The milestone the child can claim now (reached but not yet claimed in this run). */
export function claimableMilestone(streak: number, streakClaimed: number): Milestone | null {
  const claimed = streakClaimed <= streak ? streakClaimed : 0 // streak broke → re-earnable
  return STREAK_MILESTONES.find((m) => m.days <= streak && m.days > claimed) ?? null
}
/** The next milestone still ahead (for a progress hint). */
export const nextMilestone = (streak: number): Milestone | null =>
  STREAK_MILESTONES.find((m) => m.days > streak) ?? null

// KET 模考分数分阶段：金 ≥95% · 银 ≥80% · 铜 ≥60% · 不及格 <60%
export type GradeTier = 'fail' | 'bronze' | 'silver' | 'gold'
export const gradeOf = (acc: number): GradeTier =>
  acc >= 0.95 ? 'gold' : acc >= 0.8 ? 'silver' : acc >= 0.6 ? 'bronze' : 'fail'
const gradeRank: Record<GradeTier, number> = { fail: 0, bronze: 1, silver: 2, gold: 3 }

interface LessonResult {
  stars: number // 0–3 based on accuracy
  energon: number
}

// Per-day练习计数（每日任务勾选用）。跨天自动归零。
export interface DailyActivity {
  day: string
  lessons: number // 主线/Boss 关
  reviews: number // 错题修复 / 复习
  skill: number // 听力/口语/语法/词汇专项
}
const freshDaily = (day: string): DailyActivity => ({ day, lessons: 0, reviews: 0, skill: 0 })
const rollDaily = (d: DailyActivity | undefined): DailyActivity => {
  const today = todayStr()
  return d && d.day === today ? d : freshDaily(today)
}

// ---- SRS / 错题本 (stored as plain JSON) ----
export const epochDay = () => Math.floor(Date.now() / 86_400_000)
const SRS_INTERVALS = [0, 1, 2, 4, 7, 15] // days by strength 0..5

export interface SrsCard {
  ref: string
  kind: 'word' | 'item'
  topic?: string
  wrongStreak: number
  collected: boolean // in 错题本 (连错3)
  fixedStreak: number // 修复站连对
  strength: number // 0..5
  dueDay: number
  seen: number
  correct: number
}

export interface SrsStats {
  collected: number
  due: number
  learning: number
  mastered: number
  total: number
}

export function srsStats(srs: Record<string, SrsCard>): SrsStats {
  const today = epochDay()
  const cards = Object.values(srs)
  return {
    collected: cards.filter((c) => c.collected).length,
    due: cards.filter((c) => c.dueDay <= today).length,
    learning: cards.filter((c) => c.strength > 0 && c.strength < 5).length,
    mastered: cards.filter((c) => c.strength >= 5).length,
    total: cards.length,
  }
}

/** Cards to review now: collected (顽固) first, then earliest due. */
export function dueCards(
  srs: Record<string, SrsCard>,
  limit = 20,
): (SrsCard & { id: string })[] {
  const today = epochDay()
  return Object.entries(srs)
    .map(([id, c]) => ({ id, ...c }))
    .filter((c) => c.collected || c.dueDay <= today)
    .sort((a, b) => Number(b.collected) - Number(a.collected) || a.dueDay - b.dueDay)
    .slice(0, limit)
}

interface GameState {
  energon: number
  streak: number
  lastPlayed: string | null
  results: Record<string, LessonResult> // lessonId -> result
  examGrades: Record<string, GradeTier> // exam lessonId -> best grade
  vouchers: Voucher[] // 盲盒券（银+解锁）
  srs: Record<string, SrsCard> // 词/考点掌握度 + 错题本
  unlockedRobots: string[]
  dailyGoal: number
  energonToday: number
  placed: boolean // 是否已做定级扫描
  studyTotalSec: number // 累计学习用时（秒）
  studyByDay: Record<string, number> // 日期 -> 当天用时（秒）
  lastCheckIn: string | null // 最近一次"打卡领奖"的日期
  streakClaimed: number // 本轮连续打卡已领取的最高里程碑天数
  daily: DailyActivity // 今日各类练习计数（每日任务用）
  shields: number // 连击护盾数量（漏天自动护连击）
  cosmetics: string[] // 已购皮肤 id
  activeTheme: string // 当前地图主题 id
  lastChest: string | null // 最近一次开每日宝箱的日期

  // selectors
  isLessonUnlocked: (unitId: string, lessonId: string) => boolean
  isUnitComplete: (unitId: string) => boolean
  starsFor: (lessonId: string) => number

  // actions
  completeLesson: (
    unitId: string,
    lessonId: string,
    correct: number,
    total: number,
    isExam?: boolean,
  ) => {
    earned: number
    stars: number
    grade: GradeTier
    newlyUnlocked: string | null
    newVoucher: 'silver' | 'gold' | null
  }
  /** Focused-practice session (词汇专项 etc.) — awards energon only, no unlock. */
  practiceComplete: (
    correct: number,
    total: number,
    kind?: 'review' | 'skill',
  ) => { earned: number; stars: number }
  /** Record one SRS answer (错题本 + 间隔复习 rules). */
  recordAnswer: (ref: SrsRef, correct: boolean) => void
  /** Log time spent in a session (seconds). Capped to ignore idle outliers. */
  logStudyTime: (seconds: number) => void
  /** Claim today's check-in bonus (only once/day, after the daily goal is met). */
  claimDaily: () => number
  /** Claim a reached streak milestone (3/7/14/30/60 days). Returns it, or null. */
  claimStreakReward: () => Milestone | null
  /** Open today's surprise chest (once/day, after daily quests done). Returns loot. */
  openDailyChest: () => { energon: number; shield: boolean } | null
  /** Buy a 连击护盾 with energon. Returns true on success. */
  buyShield: () => boolean
  /** Buy a cosmetic (theme) by id. Returns true on success. */
  buyCosmetic: (id: string, cost: number) => boolean
  /** Equip an owned map theme. */
  equipTheme: (id: string) => void
  /** Parent marks a blind-box voucher as physically handed over. */
  redeemVoucher: (lessonId: string) => void
  /** Placement scan result — mark every lesson before `unitId` as cleared. */
  placeAt: (unitId: string) => void
  reset: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      energon: 0,
      streak: 0,
      lastPlayed: null,
      results: {},
      examGrades: {},
      vouchers: [],
      srs: {},
      unlockedRobots: ['tr3'], // start with your buddy
      dailyGoal: 30,
      energonToday: 0,
      placed: false,
      studyTotalSec: 0,
      studyByDay: {},
      lastCheckIn: null,
      streakClaimed: 0,
      daily: freshDaily(todayStr()),
      shields: 0,
      cosmetics: ['default'],
      activeTheme: 'default',
      lastChest: null,

      isLessonUnlocked: (unitId, lessonId) => {
        const idx = lessonOrder.findIndex(
          (o) => o.unitId === unitId && o.lessonId === lessonId,
        )
        if (idx <= 0) return true // first lesson always open
        const prev = lessonOrder[idx - 1]
        return !!get().results[prev.lessonId]
      },

      isUnitComplete: (unitId) => {
        const u = unitById(unitId)
        if (!u) return false
        return u.lessons.every((l) => !!get().results[l.id])
      },

      starsFor: (lessonId) => get().results[lessonId]?.stars ?? 0,

      completeLesson: (unitId, lessonId, correct, total, isExam = false) => {
        const accuracy = total ? correct / total : 0
        const stars = accuracy >= 0.95 ? 3 : accuracy >= 0.75 ? 2 : 1
        const grade = gradeOf(accuracy)
        const base = correct * 10
        const bonus = stars === 3 ? 20 : stars === 2 ? 10 : 0
        const earned = base + bonus

        const prev = get().results[lessonId]
        // Only award energon for improvement / first clear.
        const award = !prev || stars > prev.stars ? earned : Math.round(earned * 0.3)

        // streak (with 连击护盾 protection)
        const today = todayStr()
        const last = get().lastPlayed
        const adv = advanceStreak(last, today, get().streak, get().shields)
        const streak = adv.streak
        let energonToday = get().energonToday
        if (last !== today) energonToday = 0

        const results = {
          ...get().results,
          [lessonId]: {
            stars: Math.max(stars, prev?.stars ?? 0),
            energon: (prev?.energon ?? 0) + award,
          },
        }

        // exam: record best grade
        let examGrades = get().examGrades
        if (isExam && gradeRank[grade] > gradeRank[examGrades[lessonId] ?? 'fail']) {
          examGrades = { ...examGrades, [lessonId]: grade }
        }

        // staged blind-box voucher (silver+; upgrade to gold)
        let vouchers = get().vouchers
        let newVoucher: 'silver' | 'gold' | null = null
        if (isExam && (grade === 'silver' || grade === 'gold')) {
          const existing = vouchers.find((v) => v.lessonId === lessonId)
          if (!existing) {
            vouchers = [...vouchers, { lessonId, tier: grade }]
            newVoucher = grade
          } else if (grade === 'gold' && existing.tier !== 'gold') {
            vouchers = vouchers.map((v) => (v.lessonId === lessonId ? { ...v, tier: 'gold' } : v))
            newVoucher = 'gold'
          }
        }

        // robot unlock on unit completion (exam must reach bronze+ to count as passed)
        let newlyUnlocked: string | null = null
        const passed = !isExam || grade !== 'fail'
        const u = unitById(unitId)
        if (u && passed && u.lessons.every((l) => !!results[l.id])) {
          if (!get().unlockedRobots.includes(u.rewardRobotId)) {
            newlyUnlocked = u.rewardRobotId
          }
        }

        const daily = rollDaily(get().daily)
        set({
          results,
          examGrades,
          vouchers,
          energon: get().energon + award,
          energonToday: energonToday + award,
          streak,
          shields: adv.shields,
          lastPlayed: today,
          daily: { ...daily, lessons: daily.lessons + 1 },
          unlockedRobots: newlyUnlocked
            ? [...get().unlockedRobots, newlyUnlocked]
            : get().unlockedRobots,
        })

        return { earned: award, stars, grade, newlyUnlocked, newVoucher }
      },

      practiceComplete: (correct, total, kind) => {
        const accuracy = total ? correct / total : 0
        const stars = accuracy >= 0.95 ? 3 : accuracy >= 0.75 ? 2 : 1
        const earned = correct * 5 // lighter reward than main lessons

        const today = todayStr()
        const last = get().lastPlayed
        const adv = advanceStreak(last, today, get().streak, get().shields)
        const streak = adv.streak
        let energonToday = get().energonToday
        if (last !== today) energonToday = 0

        const d = rollDaily(get().daily)
        const daily =
          kind === 'review'
            ? { ...d, reviews: d.reviews + 1 }
            : kind === 'skill'
              ? { ...d, skill: d.skill + 1 }
              : d

        set({
          energon: get().energon + earned,
          energonToday: energonToday + earned,
          streak,
          shields: adv.shields,
          lastPlayed: today,
          daily,
        })
        return { earned, stars }
      },

      recordAnswer: (ref, correct) => {
        const today = epochDay()
        const prev = get().srs[ref.id]
        let wrongStreak = prev?.wrongStreak ?? 0
        let collected = prev?.collected ?? false
        let fixedStreak = prev?.fixedStreak ?? 0
        let strength = prev?.strength ?? 0

        if (correct) {
          wrongStreak = 0
          strength = Math.min(strength + 1, 5)
          if (collected) {
            fixedStreak += 1
            if (fixedStreak >= 2) {
              collected = false // 毕业出错题本
              fixedStreak = 0
            }
          }
        } else {
          wrongStreak += 1
          fixedStreak = 0
          strength = 0
          if (wrongStreak >= 3) collected = true // 连错 3 次入册
        }
        const dueDay = correct ? today + SRS_INTERVALS[strength] : today + 1

        set({
          srs: {
            ...get().srs,
            [ref.id]: {
              ref: ref.ref,
              kind: ref.kind,
              topic: ref.topic,
              wrongStreak,
              collected,
              fixedStreak,
              strength,
              dueDay,
              seen: (prev?.seen ?? 0) + 1,
              correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
            },
          },
        })
      },

      logStudyTime: (seconds) => {
        const sec = Math.min(Math.max(0, Math.round(seconds)), 1800) // cap 30min/session
        if (sec < 2) return // ignore accidental opens
        const today = todayStr()
        set({
          studyTotalSec: get().studyTotalSec + sec,
          studyByDay: { ...get().studyByDay, [today]: (get().studyByDay[today] ?? 0) + sec },
        })
      },

      claimDaily: () => {
        const today = todayStr()
        if (get().lastPlayed !== today) return 0 // must have studied today
        if (get().energonToday < get().dailyGoal) return 0 // goal not met yet
        if (get().lastCheckIn === today) return 0 // already claimed
        const bonus = 15
        set({ energon: get().energon + bonus, lastCheckIn: today })
        return bonus
      },

      claimStreakReward: () => {
        const m = claimableMilestone(get().streak, get().streakClaimed)
        if (!m) return null
        set({ energon: get().energon + m.bonus, streakClaimed: m.days })
        return m
      },

      openDailyChest: () => {
        const today = todayStr()
        if (get().lastChest === today) return null
        const energonReward = 30 + Math.floor(Math.random() * 5) * 10 // 30..70
        const shield = Math.random() < 0.25 && get().shields < SHIELD_MAX
        set({
          lastChest: today,
          energon: get().energon + energonReward,
          shields: get().shields + (shield ? 1 : 0),
        })
        return { energon: energonReward, shield }
      },

      buyShield: () => {
        if (get().energon < SHIELD_COST || get().shields >= SHIELD_MAX) return false
        set({ energon: get().energon - SHIELD_COST, shields: get().shields + 1 })
        return true
      },

      buyCosmetic: (id, cost) => {
        if (get().cosmetics.includes(id) || get().energon < cost) return false
        set({ energon: get().energon - cost, cosmetics: [...get().cosmetics, id] })
        return true
      },

      equipTheme: (id) => {
        if (get().cosmetics.includes(id)) set({ activeTheme: id })
      },

      redeemVoucher: (lessonId) =>
        set({
          vouchers: get().vouchers.map((v) =>
            v.lessonId === lessonId ? { ...v, redeemed: true } : v,
          ),
        }),

      placeAt: (unitId) => {
        const idx = CURRICULUM.findIndex((u) => u.id === unitId)
        if (idx < 0) {
          set({ placed: true })
          return
        }
        const results = { ...get().results }
        // mark every lesson in the sectors BEFORE the target as cleared (2★)
        for (let i = 0; i < idx; i++) {
          for (const l of CURRICULUM[i].lessons) {
            if (!results[l.id]) results[l.id] = { stars: 2, energon: 0 }
          }
        }
        set({ results, placed: true })
      },

      reset: () =>
        set({
          energon: 0,
          streak: 0,
          lastPlayed: null,
          results: {},
          examGrades: {},
          vouchers: [],
          srs: {},
          unlockedRobots: ['tr3'],
          energonToday: 0,
          placed: false,
          studyTotalSec: 0,
          studyByDay: {},
          lastCheckIn: null,
          streakClaimed: 0,
          daily: freshDaily(todayStr()),
          shields: 0,
          cosmetics: ['default'],
          activeTheme: 'default',
          lastChest: null,
        }),
    }),
    { name: 'cybertron-academy-v1' },
  ),
)

export const totalLessons = CURRICULUM.reduce((n, u) => n + u.lessons.length, 0)
