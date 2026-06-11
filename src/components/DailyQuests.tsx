import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { lessonByIds, lessonOrder } from '../data/curriculum'
import { useGameStore, srsStats } from '../store/useGameStore'
import { sfx } from '../lib/sfx'
import type { Lesson } from '../types'
import type { Skill } from '../lib/specialize'

// 今日专项按星期轮换(给"每天不同"的仪式感,但不打乱课程)。
const WEEK_SKILL: Record<number, { skill: Skill; label: string; emoji: string }> = {
  0: { skill: 'speak', label: '口语日', emoji: '🎙️' },
  1: { skill: 'listen', label: '听力日', emoji: '📡' },
  2: { skill: 'grammar', label: '语法日', emoji: '⚙️' },
  3: { skill: 'speak', label: '口语日', emoji: '🎙️' },
  4: { skill: 'listen', label: '听力日', emoji: '📡' },
  5: { skill: 'grammar', label: '语法日', emoji: '⚙️' },
  6: { skill: 'listen', label: '听力日', emoji: '📡' },
}

export default function DailyQuests({
  onStartMain,
  onStartReview,
  onStartSkill,
  onStartGame,
}: {
  onStartMain: (unitId: string, lesson: Lesson) => void
  onStartReview: () => void
  onStartSkill: (skill: Skill) => void
  onStartGame: (gameId: string) => void
}) {
  const daily = useGameStore((s) => s.daily)
  const results = useGameStore((s) => s.results)
  const srs = useGameStore((s) => s.srs)
  const isUnlocked = useGameStore((s) => s.isLessonUnlocked)
  const lastChest = useGameStore((s) => s.lastChest)
  const openDailyChest = useGameStore((s) => s.openDailyChest)
  const stats = srsStats(srs)
  const [loot, setLoot] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const t = daily.day === today ? daily : { lessons: 0, reviews: 0, skill: 0 }

  // next main lesson (first unlocked, not yet passed)
  const cur = (() => {
    for (const o of lessonOrder) {
      if (isUnlocked(o.unitId, o.lessonId) && !results[o.lessonId]) return o
    }
    return null
  })()
  const curLesson = cur ? lessonByIds(cur.unitId, cur.lessonId) : null
  const hasReview = stats.collected > 0 || stats.due > 0
  const dow = new Date().getDay()
  const gameDay = dow === 0 || dow === 6 // 周末 = 游戏日
  const wd = WEEK_SKILL[dow]

  type Quest = { id: string; icon: string; label: string; sub: string; done: boolean; run: () => void }
  const quests: Quest[] = [
    {
      id: 'main',
      icon: '🗺️',
      label: '推进主线',
      sub: curLesson ? curLesson.title : '全部通关 🎉',
      done: t.lessons > 0 || !curLesson,
      run: () => cur && curLesson && onStartMain(cur.unitId, curLesson),
    },
    {
      id: 'review',
      icon: '🔧',
      label: hasReview ? '修复错题' : '复习巩固',
      sub: hasReview ? `${stats.collected + stats.due} 项待修复` : '暂无错题 🎉',
      done: t.reviews > 0 || !hasReview,
      run: onStartReview,
    },
    {
      id: 'skill',
      icon: gameDay ? '🎮' : wd.emoji,
      label: gameDay ? '今日专项·游戏日' : `今日专项·${wd.label}`,
      sub: gameDay ? '竞技场任意一局' : '综合小练',
      done: t.skill > 0, // 竞技场也计入 skill,玩一局即完成
      run: gameDay ? () => onStartGame('blitz') : () => onStartSkill(wd.skill),
    },
  ]
  const doneCount = quests.filter((q) => q.done).length
  const allDone = doneCount === quests.length
  const chestReady = allDone && lastChest !== today

  const openChest = () => {
    const got = openDailyChest()
    if (got) {
      sfx.levelUp()
      setLoot(`+${got.energon} ⚡${got.shield ? '  🛡️+1' : ''}`)
      setTimeout(() => setLoot(null), 2200)
    }
  }

  // recommend: highest-priority still-actionable quest
  const recommend =
    quests.find((q) => q.id === 'review' && !q.done && hasReview) ??
    quests.find((q) => q.id === 'main' && !q.done && curLesson) ??
    quests.find((q) => q.id === 'skill' && !q.done)

  return (
    <div className="relative mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-black">
          🎯 今日任务 <span className="text-white/45">{doneCount}/3</span>
        </h3>
        {chestReady ? (
          <motion.button
            onClick={openChest}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
            className="rounded-full bg-gradient-to-r from-energon to-spark px-4 py-1.5 text-xs font-black text-[#1a1300]"
          >
            🎁 开启惊喜宝箱
          </motion.button>
        ) : allDone ? (
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
            全部完成 🎉 宝箱已开
          </span>
        ) : recommend ? (
          <button
            onClick={recommend.run}
            className="rounded-full bg-cyber px-4 py-1.5 text-xs font-black text-black active:scale-95"
          >
            今日推荐 ▶ {recommend.label}
          </button>
        ) : null}
      </div>

      {/* chest loot reveal */}
      <AnimatePresence>
        {loot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute right-4 top-9 z-10 rounded-xl border border-energon/50 bg-[#1a1606] px-3 py-1.5 text-sm font-black text-energon shadow-lg"
          >
            🎁 {loot}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2">
        {quests.map((q) => (
          <button
            key={q.id}
            onClick={q.run}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition active:scale-95 ${
              q.done
                ? 'border-emerald-400/40 bg-emerald-400/10'
                : 'border-white/12 bg-white/[0.04] hover:border-cyber/50'
            }`}
          >
            <span className="text-xl">{q.done ? '✅' : q.icon}</span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold">{q.label}</span>
              <span className="block truncate text-[10px] text-white/50">{q.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
