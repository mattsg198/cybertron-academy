import { useGameStore } from '../../store/useGameStore'
import { ARCADE_GAMES } from '../../lib/arcade'
import { TOKEN_ENERGON } from '../../data/shop'
import { robotById } from '../../data/robots'
import RobotAvatar from '../RobotAvatar'
import Leaderboard from './Leaderboard'

// 🎮 竞技场首页:券余额 + 攒券进度 + 三款反应游戏(个人最佳)。
export default function ArcadeHub({ onStartGame }: { onStartGame: (gameId: string) => void }) {
  const arcadeBest = useGameStore((s) => s.arcadeBest)
  const tokens = useGameStore((s) => s.tokens)
  const tokenProg = useGameStore((s) => s.tokenProg)
  const inspector = robotById('tr3')
  const pct = Math.round((tokenProg / TOKEN_ENERGON) * 100)

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-black">🎮 竞技场 · Arcade</h1>
          <span className="rounded-full bg-energon/15 px-4 py-1.5 text-lg font-black text-energon">🎟️ {tokens}</span>
        </div>

        {/* intro + token progress */}
        <div className="mb-6 rounded-3xl border border-spark/30 bg-spark/5 p-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">
              <RobotAvatar robot={inspector} sizeClass="text-5xl" />
            </span>
            <div>
              <p className="font-black text-spark">汽车人探长：反应越快越强!</p>
              <p className="text-sm text-white/70">
                玩游戏也在复习——题目优先来自你的<b className="text-white/90">到期词 + 错题</b>。
                每天免费送 1 张券,学习赚能量还会自动攒券。
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-white/55">
              <span>距下一张游戏券</span>
              <span>{tokenProg}/{TOKEN_ENERGON} ⚡</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyber to-energon" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* games */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ARCADE_GAMES.map((g) => (
            <button
              key={g.id}
              onClick={g.ready ? () => onStartGame(g.id) : undefined}
              disabled={!g.ready}
              className={`relative rounded-3xl border-2 p-6 text-left transition ${
                g.ready
                  ? 'border-spark/40 bg-spark/10 hover:scale-[1.02] active:scale-95'
                  : 'border-white/10 bg-white/[0.03] opacity-60'
              }`}
            >
              <div className="text-5xl">{g.emoji}</div>
              <div className="mt-2 text-xl font-black">{g.name}</div>
              <div className="mt-1 text-sm text-white/60">{g.desc}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-energon">🏆 最佳 {arcadeBest[g.id] ?? 0}</span>
                {g.ready ? (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-white/70">1🎟️/局</span>
                ) : (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">soon</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 今日学习榜 */}
        <div className="mt-6">
          <Leaderboard />
        </div>
      </div>
    </div>
  )
}
