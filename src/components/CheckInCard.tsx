import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore, claimableMilestone, nextMilestone } from '../store/useGameStore'
import { sfx } from '../lib/sfx'

const WD = ['日', '一', '二', '三', '四', '五', '六']

// 每日打卡：连续天数 + 本周打卡格 + 今日目标领能量 + 连续里程碑大奖。
export default function CheckInCard() {
  const streak = useGameStore((s) => s.streak)
  const dailyGoal = useGameStore((s) => s.dailyGoal)
  const energonToday = useGameStore((s) => s.energonToday)
  const lastPlayed = useGameStore((s) => s.lastPlayed)
  const lastCheckIn = useGameStore((s) => s.lastCheckIn)
  const studyByDay = useGameStore((s) => s.studyByDay)
  const streakClaimed = useGameStore((s) => s.streakClaimed)
  const claimDaily = useGameStore((s) => s.claimDaily)
  const claimStreakReward = useGameStore((s) => s.claimStreakReward)

  const [reward, setReward] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const earnedToday = lastPlayed === today ? energonToday : 0
  const pct = Math.min(100, Math.round((earnedToday / dailyGoal) * 100))
  const goalMet = earnedToday >= dailyGoal
  const claimed = lastCheckIn === today

  const milestone = claimableMilestone(streak, streakClaimed)
  const next = nextMilestone(streak)

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000)
    const key = d.toISOString().slice(0, 10)
    return { key, wd: WD[d.getDay()], studied: (studyByDay[key] ?? 0) > 0, isToday: key === today }
  })

  const pop = (txt: string) => {
    setReward(txt)
    setTimeout(() => setReward(null), 1700)
  }
  const onClaimDaily = () => {
    const got = claimDaily()
    if (got > 0) {
      sfx.levelUp()
      pop(`+${got} ⚡`)
    }
  }
  const onClaimMilestone = () => {
    const m = claimStreakReward()
    if (m) {
      sfx.levelUp()
      pop(`${m.emoji} +${m.bonus} ⚡`)
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* milestone big-reward banner (only when one is reached) */}
      <AnimatePresence>
        {milestone && (
          <motion.button
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={onClaimMilestone}
            className="mb-2 flex w-full items-center justify-between rounded-2xl border border-energon/60 bg-gradient-to-r from-energon/25 to-spark/20 px-4 py-2.5 text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{milestone.emoji}</span>
              <div>
                <div className="text-sm font-black text-energon">里程碑达成 · {milestone.label}！</div>
                <div className="text-[11px] text-white/60">连续打卡 {streak} 天,领取大奖</div>
              </div>
            </div>
            <span className="rounded-full bg-energon px-4 py-1.5 text-sm font-black text-[#1a1300]">
              领 +{milestone.bonus} ⚡
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* main row */}
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
        {/* streak */}
        <div className="flex shrink-0 flex-col items-center">
          <div className="text-2xl font-black leading-none text-energon">🔥{streak}</div>
          <div className="text-[10px] text-white/55">连续打卡</div>
          {next && (
            <div className="mt-0.5 text-[9px] text-white/40">距{next.label} {next.days - streak}天</div>
          )}
        </div>

        {/* week strip */}
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {week.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-0.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  d.studied
                    ? 'bg-cyber/80 text-black'
                    : d.isToday
                      ? 'border border-energon/70 text-energon'
                      : 'bg-white/8 text-white/40'
                }`}
              >
                {d.studied ? '✓' : d.wd}
              </div>
              <div className="text-[9px] text-white/35">{d.wd}</div>
            </div>
          ))}
        </div>

        {/* daily goal / check-in */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          {claimed ? (
            <div className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-sm font-black text-emerald-300">
              ✅ 今日已打卡
            </div>
          ) : goalMet ? (
            <button
              onClick={onClaimDaily}
              className="rounded-full bg-energon px-4 py-1.5 text-sm font-black text-[#1a1300] active:scale-95"
            >
              🎁 打卡领 ⚡
            </button>
          ) : (
            <>
              <div className="text-xs font-bold text-white/70">
                今日目标 {earnedToday}/{dailyGoal} ⚡
              </div>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyber to-energon" style={{ width: `${pct}%` }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* reward pop */}
      <AnimatePresence>
        {reward && (
          <motion.div
            initial={{ y: 0, opacity: 0, scale: 0.6 }}
            animate={{ y: -30, opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute right-6 top-2 text-lg font-black text-energon"
          >
            {reward}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
