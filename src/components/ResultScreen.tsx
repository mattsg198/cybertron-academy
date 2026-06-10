import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { robotById } from '../data/robots'
import type { GradeTier } from '../store/useGameStore'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sfx'
import RobotAvatar from './RobotAvatar'

const GRADE: Record<GradeTier, { icon: string; label: string; tone: string; msg: string }> = {
  gold: { icon: '🥇', label: '金牌 · GOLD', tone: 'text-energon', msg: '探长：完美破案，你太强了！' },
  silver: { icon: '🥈', label: '银牌 · SILVER', tone: 'text-cyber', msg: '探长：出色，稳稳通过！' },
  bronze: { icon: '🥉', label: '铜牌 · BRONZE', tone: 'text-amber-300', msg: '探长：通关！再冲银牌更棒！' },
  fail: { icon: '💢', label: '未通过', tone: 'text-rose-300', msg: '探长：差一点，再练练就过！' },
}

export default function ResultScreen({
  earned,
  stars,
  correct,
  total,
  newlyUnlocked,
  isExam = false,
  grade = 'bronze',
  newVoucher = null,
  onContinue,
}: {
  earned: number
  stars: number
  correct: number
  total: number
  newlyUnlocked: string | null
  isExam?: boolean
  grade?: GradeTier
  newVoucher?: 'silver' | 'gold' | null
  onContinue: () => void
}) {
  const robot = newlyUnlocked ? robotById(newlyUnlocked) : null
  const pct = total ? Math.round((correct / total) * 100) : 0
  const g = GRADE[grade]
  const lessonCheer =
    stars === 3
      ? '探长：满星通关,神探级表现！⭐'
      : stars === 2
        ? '探长：很棒!再练一次冲满星 🌟'
        : '探长：通关!多练几次会更稳 💪'
  const celebrate = stars === 3 || !!robot || (isExam && (grade === 'silver' || grade === 'gold'))

  useEffect(() => {
    if (robot) {
      sfx.transform()
      const t = setTimeout(() => speak(`You unlocked ${robot.name}!`), 600)
      return () => clearTimeout(t)
    }
  }, [robot])

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-6 py-8 text-center">
      {celebrate && <Confetti />}
      {isExam ? (
        <>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 12 }}
            className="text-8xl"
          >
            {g.icon}
          </motion.div>
          <h1 className={`mt-3 text-3xl font-black ${g.tone}`}>{g.label}</h1>
          <p className="mt-1 text-lg text-white/70">KET 模考得分 {pct}%</p>
          <p className="mt-2 font-semibold text-white/80">{g.msg}</p>
        </>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 12 }}
            className="text-7xl"
          >
            {stars === 3 ? '🏆' : stars === 2 ? '🌟' : '✅'}
          </motion.div>
          <h1 className="mt-4 text-3xl font-black text-energon">Lesson Complete!</h1>
          <div className="mt-3 text-3xl">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className={i < stars ? 'text-energon' : 'text-white/15'}
              >
                ★
              </motion.span>
            ))}
          </div>
          <p className="mt-2 font-semibold text-white/80">{lessonCheer}</p>
        </>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-energon/40 bg-energon/10 px-6 py-4">
          <div className="text-2xl font-black text-energon">+{earned} ⚡</div>
          <div className="text-xs text-white/60">Energon</div>
        </div>
        <div className="rounded-2xl border border-cyber/40 bg-cyber/10 px-6 py-4">
          <div className="text-2xl font-black text-cyber">
            {correct}/{total}
          </div>
          <div className="text-xs text-white/60">{isExam ? '首答正确' : 'Correct'}</div>
        </div>
      </div>

      {/* staged blind-box incentive (exam only) */}
      {isExam && (grade === 'silver' || grade === 'gold') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="mt-6 rounded-3xl border-2 border-autobot/50 bg-autobot/10 px-8 py-5"
        >
          <div className="text-5xl">🎁</div>
          <p className="mt-1 text-lg font-black text-autobot">
            布鲁可盲盒券 ×1（{grade === 'gold' ? '隐藏款' : '标准款'}）
          </p>
          <p className="text-sm text-white/70">
            {newVoucher ? '新到手！去家长中心兑换实物盲盒 🎉' : '已在你的盲盒券里'}
          </p>
        </motion.div>
      )}
      {isExam && grade === 'bronze' && (
        <p className="mt-6 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-white/75">
          🎁 盲盒需 <b className="text-cyber">银牌（≥80%）</b> 解锁 —— 再挑战一次冲银牌！
        </p>
      )}
      {isExam && grade === 'fail' && (
        <p className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-6 py-4 text-white/75">
          需 <b className="text-amber-300">≥60%</b> 才能突破 —— 探长陪你再来一次！
        </p>
      )}

      {robot && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="mt-6 rounded-3xl border-2 border-cyber/50 bg-cyber/10 px-8 py-6"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-cyber">New Autobot Unlocked!</p>
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="my-2 text-8xl"
          >
            <RobotAvatar robot={robot} sizeClass="text-8xl" />
          </motion.div>
          <p className="text-xl font-black">{robot.name}</p>
          <p className="text-sm text-white/70">{robot.tagline}</p>
        </motion.div>
      )}

      <button
        onClick={onContinue}
        className="mt-8 w-full max-w-xs rounded-2xl bg-energon py-4 text-xl font-black text-[#1a1300] active:scale-95"
      >
        {isExam && grade === 'fail' ? '再来一次' : 'Continue'}
      </button>
    </div>
  )
}

// 庆祝彩屑：从顶部中央迸发的 emoji 粒子。
function Confetti() {
  const bits = ['⭐', '⚡', '🎉', '✨', '🏆', '🌟']
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 360
        const y = 120 + Math.random() * 320
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, x, y, scale: 1.2, rotate: Math.random() * 360 }}
            transition={{ duration: 1.3 + Math.random() * 0.6, ease: 'easeOut' }}
            className="absolute left-1/2 top-24 text-2xl"
          >
            {bits[i % bits.length]}
          </motion.span>
        )
      })}
    </div>
  )
}
