import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { ARCADE_GAMES } from '../../lib/arcade'
import { sfx } from '../../lib/sfx'
import EnergonBlitz from './EnergonBlitz'
import Firewall from './Firewall'
import SonicIntercept from './SonicIntercept'

// 竞技场容器:跑某款游戏 → 结算页(分数/最佳/能量/破纪录)。
export default function Arcade({ gameId, onQuit }: { gameId: string; onQuit: () => void }) {
  const arcadeFinish = useGameStore((s) => s.arcadeFinish)
  const def = ARCADE_GAMES.find((g) => g.id === gameId)
  const [runKey, setRunKey] = useState(0) // 重开一局用
  const [result, setResult] = useState<{ score: number; best: number; earned: number; isNewBest: boolean } | null>(null)

  const handleEnd = (score: number, correct: number) => {
    const r = arcadeFinish(gameId, score, correct)
    sfx.levelUp()
    setResult({ score, ...r })
  }

  const playAgain = () => {
    setResult(null)
    setRunKey((k) => k + 1)
  }

  if (result) {
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
        </div>
        {result.earned === 0 && (
          <p className="text-xs text-white/45">今日竞技场能量已达上限,明天再来刷分~</p>
        )}
        <div className="mt-2 flex gap-3">
          <button onClick={playAgain} className="rounded-2xl bg-cyber px-8 py-3 text-lg font-black text-black active:scale-95">
            再来一局 ▶
          </button>
          <button onClick={onQuit} className="rounded-2xl bg-white/10 px-6 py-3 text-lg font-black text-white/80 active:scale-95">
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-dvh">
      <button
        onClick={onQuit}
        className="absolute left-4 top-4 z-10 text-2xl text-white/50 hover:text-white"
        aria-label="Quit"
      >
        ✕
      </button>
      {gameId === 'blitz' ? (
        <EnergonBlitz key={runKey} onEnd={handleEnd} />
      ) : gameId === 'firewall' ? (
        <Firewall key={runKey} onEnd={handleEnd} />
      ) : gameId === 'sonic' ? (
        <SonicIntercept key={runKey} onEnd={handleEnd} />
      ) : (
        <div className="flex h-full items-center justify-center text-white/60">敬请期待…</div>
      )}
    </div>
  )
}
