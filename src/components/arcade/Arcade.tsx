import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { ARCADE_GAMES } from '../../lib/arcade'
import { sfx } from '../../lib/sfx'
import EnergonBlitz from './EnergonBlitz'
import Firewall from './Firewall'
import SonicIntercept from './SonicIntercept'
import WordRain from './WordRain'
import SkyStriker from './SkyStriker'

type Phase = 'ready' | 'play' | 'done'

// 竞技场容器:入场闸(消耗 1🎟️)→ 游戏 → 结算。
export default function Arcade({ gameId, onQuit }: { gameId: string; onQuit: () => void }) {
  const arcadeFinish = useGameStore((s) => s.arcadeFinish)
  const spendToken = useGameStore((s) => s.spendToken)
  const tokens = useGameStore((s) => s.tokens)
  const def = ARCADE_GAMES.find((g) => g.id === gameId)

  const [phase, setPhase] = useState<Phase>('ready')
  const [runKey, setRunKey] = useState(0)
  const [result, setResult] = useState<{ score: number; best: number; earned: number; isNewBest: boolean } | null>(null)

  const start = () => {
    if (!spendToken()) return // 券不足
    setResult(null)
    setRunKey((k) => k + 1)
    setPhase('play')
  }

  const handleEnd = (score: number, correct: number) => {
    const r = arcadeFinish(gameId, score, correct)
    sfx.levelUp()
    setResult({ score, ...r })
    setPhase('done')
  }

  // —— 入场闸 ——
  if (phase === 'ready') {
    return (
      <div className="mx-auto flex h-dvh max-w-md flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="text-7xl">{def?.emoji ?? '🎮'}</div>
        <h1 className="text-3xl font-black">{def?.name}</h1>
        <p className="text-white/65">{def?.desc}</p>
        <div className="rounded-full bg-energon/15 px-4 py-1.5 text-lg font-black text-energon">
          🎟️ 游戏券 ×{tokens}
        </div>
        {tokens >= 1 ? (
          <button onClick={start} className="rounded-2xl bg-cyber px-10 py-3 text-xl font-black text-black active:scale-95">
            开始 ▶ <span className="text-sm">(消耗 1🎟️)</span>
          </button>
        ) : (
          <p className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm text-white/70">
            游戏券用完啦~ 去做主线/错题/任务,赚够能量会自动攒券;<br />也可在探长店用能量买券。
          </p>
        )}
        <button onClick={onQuit} className="text-sm text-white/40 hover:text-white/70">
          返回
        </button>
      </div>
    )
  }

  // —— 结算 ——
  if (phase === 'done' && result) {
    return (
      <div className="mx-auto flex h-dvh max-w-md flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="text-6xl">{def?.emoji ?? '🎮'}</div>
        {result.isNewBest && (
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            className="rounded-full bg-energon px-4 py-1 text-sm font-black text-[#1a1300]"
          >
            🏆 新纪录!
          </motion.div>
        )}
        <div className="text-5xl font-black text-energon">{result.score}</div>
        <div className="text-sm text-white/60">本局得分</div>
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-xl font-black text-cyber">🏆 {result.best}</div>
            <div className="text-xs text-white/55">个人最佳</div>
          </div>
          <div>
            <div className="text-xl font-black text-energon">+{result.earned} ⚡</div>
            <div className="text-xs text-white/55">能量奖励</div>
          </div>
          <div>
            <div className="text-xl font-black text-white">🎟️ {tokens}</div>
            <div className="text-xs text-white/55">剩余券</div>
          </div>
        </div>
        {result.earned === 0 && <p className="text-xs text-white/45">今日竞技场能量已达上限,明天再来刷分~</p>}
        <div className="mt-2 flex gap-3">
          <button
            onClick={start}
            disabled={tokens < 1}
            className={`rounded-2xl px-8 py-3 text-lg font-black active:scale-95 ${
              tokens >= 1 ? 'bg-cyber text-black' : 'bg-white/10 text-white/40'
            }`}
          >
            再玩 ▶ (1🎟️)
          </button>
          <button onClick={onQuit} className="rounded-2xl bg-white/10 px-6 py-3 text-lg font-black text-white/80 active:scale-95">
            返回
          </button>
        </div>
      </div>
    )
  }

  // —— 游戏中 ——
  return (
    <div className="relative h-dvh">
      <button onClick={onQuit} className="absolute left-4 top-4 z-10 text-2xl text-white/50 hover:text-white" aria-label="Quit">
        ✕
      </button>
      {gameId === 'blitz' ? (
        <EnergonBlitz key={runKey} onEnd={handleEnd} />
      ) : gameId === 'firewall' ? (
        <Firewall key={runKey} onEnd={handleEnd} />
      ) : gameId === 'sonic' ? (
        <SonicIntercept key={runKey} onEnd={handleEnd} />
      ) : gameId === 'rain' ? (
        <WordRain key={runKey} onEnd={handleEnd} />
      ) : gameId === 'shooter' ? (
        <SkyStriker key={runKey} onEnd={handleEnd} />
      ) : (
        <div className="flex h-full items-center justify-center text-white/60">敬请期待…</div>
      )}
    </div>
  )
}
