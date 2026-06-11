import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { dailyBoard, rankOf } from '../../lib/leaderboard'
import AssetImage from '../AssetImage'

const MEDAL = ['🥇', '🥈', '🥉']

// 🏆 今日学习榜:孩子 vs AI 学员,按当日积分排名,带互动台词。
export default function Leaderboard() {
  const energonToday = useGameStore((s) => s.energonToday)
  const lastPlayed = useGameStore((s) => s.lastPlayed)
  const today = new Date().toISOString().slice(0, 10)
  const myScore = lastPlayed === today ? energonToday : 0

  // 每 30 秒刷新一次,让 AI 分数随时间"长"起来。
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  const board = dailyBoard(myScore)
  const rank = rankOf(board)
  const youIdx = rank - 1
  const above = youIdx > 0 ? board[youIdx - 1] : null

  const headline =
    rank === 1
      ? '👑 你在领跑!守住第一名!'
      : above
        ? `再得 ${above.score - myScore + 1} ⚡ 就能超过 ${above.name}!`
        : '开始学习,冲上排行榜!'

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-xl font-black">🏆 今日学习榜</h2>
        <span className="rounded-full bg-energon/15 px-3 py-1 text-sm font-black text-energon">
          第 {rank} / {board.length} 名
        </span>
      </div>
      <p className="mb-3 text-sm font-bold text-cyber">{headline}</p>

      <div className="space-y-1.5">
        {board.map((r, i) => (
          <motion.div
            key={r.id}
            layout
            className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
              r.you ? 'border border-cyber/50 bg-cyber/10' : 'bg-white/[0.03]'
            }`}
          >
            <span className="w-6 text-center text-sm font-black text-white/60">{MEDAL[i] ?? i + 1}</span>
            <AssetImage
              slot={r.you ? 'robots/tr3.png' : `students/${r.id}.png`}
              emoji={r.emoji}
              sizeClass="text-2xl"
            />
            <span className={`flex-1 font-bold ${r.you ? 'text-cyber' : ''}`}>
              {r.name}
              {!r.you && r.student && (
                <span className="ml-2 text-xs font-normal text-white/45">
                  {r.score > myScore ? r.student.taunt : r.student.cheer}
                </span>
              )}
            </span>
            <span className="font-black text-energon">{r.score} ⚡</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-white/40">分数 = 今日获得能量;多做主线/专项/游戏就能往上爬。</p>
    </div>
  )
}
