import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { arcadeEmojiWords, pick, shuffle } from '../../lib/arcade'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'
import type { WordEntry } from '../../data/wordbank'

const GAME_SEC = 45
const WRONG_PENALTY = 2

type Round = { target: WordEntry; options: WordEntry[] }

// 📡 声波拦截:听 TTS 读词 → 限时点出对应图标。复用词库 emoji;判对喂 SRS。
export default function SonicIntercept({ onEnd }: { onEnd: (score: number, correct: number) => void }) {
  const srs = useGameStore((s) => s.srs)
  const recordAnswer = useGameStore((s) => s.recordAnswer)

  const pool = useMemo(() => arcadeEmojiWords(srs, 80), [srs])
  const idx = useRef(0)
  const correctRef = useRef(0)
  const endedRef = useRef(false)

  const makeRound = (i: number): Round => {
    const target = pool[i % pool.length]
    const others = pick(pool.filter((w) => w.emoji !== target.emoji), 3)
    return { target, options: shuffle([target, ...others]) }
  }

  const [round, setRound] = useState<Round>(() => makeRound(0))
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SEC)
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)
  const [locked, setLocked] = useState(false)

  // speak the target whenever the round changes
  useEffect(() => {
    speak(round.target.word)
  }, [round])

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
      setScore((s) => s + 10 + combo * 2)
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
      setRound(makeRound(idx.current))
    }, 160)
  }

  const pctTime = (timeLeft / GAME_SEC) * 100

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-6 pt-5">
      <div className="mb-4 flex items-center gap-4">
        <div className="text-lg font-black text-energon">⚡{score}</div>
        {combo >= 2 && <div className="rounded-full bg-spark/20 px-2 py-0.5 text-sm font-black text-spark">🔥x{combo}</div>}
        <div className="ml-auto text-sm font-black tabular-nums text-white/70">{timeLeft}s</div>
      </div>
      <div className="mb-8 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${pctTime}%`, background: timeLeft <= 8 ? '#ff4d6d' : '#00d9ff' }}
        />
      </div>

      <div className="mb-8 flex flex-col items-center">
        <p className="mb-3 text-sm font-bold text-white/50">听一听,点出对应的图</p>
        <button
          onClick={() => speak(round.target.word)}
          className={`flex h-24 w-24 items-center justify-center rounded-full border-2 text-5xl transition active:scale-95 ${
            flash === 'ok' ? 'border-emerald-400 bg-emerald-400/10' : flash === 'bad' ? 'border-rose-400 bg-rose-400/10' : 'border-cyber/50 bg-cyber/10'
          }`}
          aria-label="再听一次"
        >
          🔊
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {round.options.map((w) => (
          <motion.button
            key={w.word}
            whileTap={{ scale: 0.93 }}
            onClick={() => answer(w)}
            className="rounded-2xl border-2 border-white/15 bg-white/5 py-7 text-6xl transition hover:border-cyber"
          >
            {w.emoji}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
