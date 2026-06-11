import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { arcadeWords, pick, shuffle } from '../../lib/arcade'
import { sfx } from '../../lib/sfx'
import type { WordEntry } from '../../data/wordbank'

const GAME_SEC = 45
const WRONG_PENALTY = 2 // 答错扣秒,增加反应压力

type Round = { target: WordEntry; options: WordEntry[] }

// ⚡ 能量速配:看中文,限时点出对应英文。连击翻倍,答错扣时间。答对喂 SRS。
export default function EnergonBlitz({ onEnd }: { onEnd: (score: number, correct: number) => void }) {
  const srs = useGameStore((s) => s.srs)
  const recordAnswer = useGameStore((s) => s.recordAnswer)

  const pool = useMemo(() => arcadeWords(srs, 60), [srs])
  const idx = useRef(0)
  const correctRef = useRef(0)
  const endedRef = useRef(false)

  const [round, setRound] = useState<Round>(() => makeRound(pool, 0))
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SEC)
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)
  const [locked, setLocked] = useState(false)

  function makeRound(p: WordEntry[], i: number): Round {
    const target = p[i % p.length]
    const others = pick(
      p.filter((w) => w.word !== target.word && w.zh !== target.zh),
      3,
    )
    return { target, options: shuffle([target, ...others]) }
  }

  // countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!endedRef.current) {
        endedRef.current = true
        onEnd(score, correctRef.current)
      }
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, score, onEnd])

  const answer = (w: WordEntry) => {
    if (locked || timeLeft <= 0) return
    const ok = w.word === round.target.word
    if (ok) {
      const gain = 10 + combo * 2
      setScore((s) => s + gain)
      setCombo((c) => c + 1)
      correctRef.current += 1
      recordAnswer({ id: `w:${round.target.word}`, kind: 'word', ref: round.target.word }, true)
      sfx.correct()
      setFlash('ok')
    } else {
      setCombo(0)
      setTimeLeft((s) => Math.max(0, s - WRONG_PENALTY))
      sfx.wrong()
      setFlash('bad')
    }
    setLocked(true)
    setTimeout(() => {
      setFlash(null)
      setLocked(false)
      idx.current += 1
      setRound(makeRound(pool, idx.current))
    }, 160)
  }

  const pctTime = (timeLeft / GAME_SEC) * 100

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-6 pt-5">
      {/* HUD */}
      <div className="mb-4 flex items-center gap-4">
        <div className="text-lg font-black text-energon">⚡{score}</div>
        {combo >= 2 && <div className="rounded-full bg-spark/20 px-2 py-0.5 text-sm font-black text-spark">🔥x{combo}</div>}
        <div className="ml-auto text-sm font-black tabular-nums text-white/70">{timeLeft}s</div>
      </div>
      <div className="mb-6 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${pctTime}%`, background: timeLeft <= 8 ? '#ff4d6d' : '#00d9ff' }}
        />
      </div>

      {/* prompt */}
      <motion.div
        key={round.target.word + idx.current}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`mb-8 rounded-3xl border-2 py-8 text-center transition-colors ${
          flash === 'ok'
            ? 'border-emerald-400 bg-emerald-400/10'
            : flash === 'bad'
              ? 'border-rose-400 bg-rose-400/10'
              : 'border-white/15 bg-white/5'
        }`}
      >
        {round.target.emoji && <div className="text-5xl">{round.target.emoji}</div>}
        <div className="mt-1 text-4xl font-black">{round.target.zh}</div>
      </motion.div>

      {/* options */}
      <div className="grid grid-cols-2 gap-4">
        {round.options.map((w) => (
          <button
            key={w.word}
            onClick={() => answer(w)}
            className="rounded-2xl border-2 border-white/15 bg-white/5 py-6 text-2xl font-extrabold transition hover:border-cyber active:scale-95"
          >
            {w.word}
          </button>
        ))}
      </div>
    </div>
  )
}
