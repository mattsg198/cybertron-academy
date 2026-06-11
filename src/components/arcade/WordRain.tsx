import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { arcadeWords, pick, shuffle } from '../../lib/arcade'
import { sfx } from '../../lib/sfx'
import type { WordEntry } from '../../data/wordbank'

const GAME_SEC = 45

type Chip = { key: number; word: string; x: number; isTarget: boolean }
type Round = { target: WordEntry; chips: Chip[]; dur: number }

// 🌧️ 单词雨:看中文,在落下的英文里点中对应的那个;落到底没接住=漏。判对喂 SRS。
export default function WordRain({ onEnd }: { onEnd: (score: number, correct: number) => void }) {
  const srs = useGameStore((s) => s.srs)
  const recordAnswer = useGameStore((s) => s.recordAnswer)
  const pool = useMemo(() => arcadeWords(srs, 80), [srs])

  const areaRef = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(420)
  useLayoutEffect(() => {
    if (areaRef.current) setH(areaRef.current.clientHeight)
  }, [])

  const idx = useRef(0)
  const keyRef = useRef(0)
  const correctRef = useRef(0)
  const endedRef = useRef(false)
  const resolved = useRef(false)
  const scoreRef = useRef(0)

  const makeRound = (i: number): Round => {
    resolved.current = false
    const target = pool[i % pool.length]
    const others = pick(pool.filter((w) => w.word !== target.word && w.zh !== target.zh), 3)
    const items = shuffle([{ w: target, t: true }, ...others.map((w) => ({ w, t: false }))])
    const chips = items.map((o) => ({ key: keyRef.current++, word: o.w.word, x: 6 + Math.random() * 76, isTarget: o.t }))
    const dur = Math.max(2, 3.6 - scoreRef.current / 700)
    return { target, chips, dur }
  }

  const [round, setRound] = useState<Round>(() => makeRound(0))
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SEC)

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

  const next = () => {
    idx.current += 1
    setRound(makeRound(idx.current))
  }
  const targetMiss = () => {
    if (resolved.current || timeLeft <= 0) return
    resolved.current = true
    setCombo(0)
    sfx.wrong()
    next()
  }
  const tap = (chip: Chip) => {
    if (resolved.current || timeLeft <= 0) return
    if (chip.isTarget) {
      resolved.current = true
      const gain = 10 + combo * 2
      setScore((s) => {
        scoreRef.current = s + gain
        return s + gain
      })
      setCombo((c) => c + 1)
      correctRef.current += 1
      recordAnswer({ id: `w:${round.target.word}`, kind: 'word', ref: round.target.word }, true)
      sfx.correct()
      next()
    } else {
      setCombo(0)
      setTimeLeft((s) => Math.max(0, s - 2))
      sfx.wrong()
    }
  }

  const pctTime = (timeLeft / GAME_SEC) * 100

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-6 pt-5">
      <div className="mb-3 flex items-center gap-4">
        <div className="text-lg font-black text-energon">⚡{score}</div>
        {combo >= 2 && <div className="rounded-full bg-spark/20 px-2 py-0.5 text-sm font-black text-spark">🔥x{combo}</div>}
        <div className="ml-auto text-sm font-black tabular-nums text-white/70">{timeLeft}s</div>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-[width] duration-1000 ease-linear" style={{ width: `${pctTime}%`, background: timeLeft <= 8 ? '#ff4d6d' : '#00d9ff' }} />
      </div>

      <div className="mb-2 text-center">
        <span className="text-sm text-white/50">接住:</span>{' '}
        {round.target.emoji && <span className="text-2xl">{round.target.emoji}</span>}{' '}
        <span className="text-2xl font-black">{round.target.zh}</span>
      </div>

      {/* falling area */}
      <div ref={areaRef} className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        {round.chips.map((chip) => (
          <motion.button
            key={chip.key}
            initial={{ y: -44 }}
            animate={{ y: h }}
            transition={{ duration: round.dur, ease: 'linear' }}
            onAnimationComplete={() => chip.isTarget && targetMiss()}
            onClick={() => tap(chip)}
            style={{ left: `${chip.x}%` }}
            className="absolute top-0 rounded-xl border-2 border-cyber/40 bg-[#0a0f2c] px-3 py-2 text-lg font-extrabold shadow-lg active:scale-90"
          >
            {chip.word}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
