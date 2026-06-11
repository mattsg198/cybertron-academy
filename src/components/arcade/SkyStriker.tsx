import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { arcadeWords, pick, shuffle } from '../../lib/arcade'
import { sfx } from '../../lib/sfx'
import type { WordEntry } from '../../data/wordbank'

const GAME_SEC = 45

type Foe = { key: number; word: string; x: number; isTarget: boolean }
type Wave = { target: WordEntry; foes: Foe[]; dur: number }

// 🚀 飞机射击:看中文,击落带对应英文的敌机;漏过=失分。判对喂 SRS。
export default function SkyStriker({ onEnd }: { onEnd: (score: number, correct: number) => void }) {
  const srs = useGameStore((s) => s.srs)
  const recordAnswer = useGameStore((s) => s.recordAnswer)
  const pool = useMemo(() => arcadeWords(srs, 80), [srs])

  const areaRef = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(440)
  useLayoutEffect(() => {
    if (areaRef.current) setH(areaRef.current.clientHeight)
  }, [])

  const idx = useRef(0)
  const keyRef = useRef(0)
  const correctRef = useRef(0)
  const endedRef = useRef(false)
  const resolved = useRef(false)
  const scoreRef = useRef(0)

  const makeWave = (i: number): Wave => {
    resolved.current = false
    const target = pool[i % pool.length]
    const others = pick(pool.filter((w) => w.word !== target.word && w.zh !== target.zh), 3)
    const items = shuffle([{ w: target, t: true }, ...others.map((w) => ({ w, t: false }))])
    const foes = items.map((o, k) => ({ key: keyRef.current++, word: o.w.word, x: 8 + k * 23 + Math.random() * 6, isTarget: o.t }))
    const dur = Math.max(1.7, 3.2 - scoreRef.current / 650)
    return { target, foes, dur }
  }

  const [wave, setWave] = useState<Wave>(() => makeWave(0))
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SEC)
  const [boom, setBoom] = useState<{ key: number; x: number; y: number } | null>(null)

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
    setWave(makeWave(idx.current))
  }
  const targetMiss = () => {
    if (resolved.current || timeLeft <= 0) return
    resolved.current = true
    setCombo(0)
    sfx.wrong()
    next()
  }
  const shoot = (foe: Foe, e: React.MouseEvent) => {
    if (resolved.current || timeLeft <= 0) return
    const rect = areaRef.current?.getBoundingClientRect()
    if (rect) setBoom({ key: keyRef.current++, x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => setBoom(null), 360)
    if (foe.isTarget) {
      resolved.current = true
      const gain = 10 + combo * 2
      setScore((s) => {
        scoreRef.current = s + gain
        return s + gain
      })
      setCombo((c) => c + 1)
      correctRef.current += 1
      recordAnswer({ id: `w:${foe.word}`, kind: 'word', ref: foe.word }, true)
      sfx.transform()
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
        <span className="text-sm text-white/50">🎯 击落:</span>{' '}
        {wave.target.emoji && <span className="text-2xl">{wave.target.emoji}</span>}{' '}
        <span className="text-2xl font-black">{wave.target.zh}</span>
      </div>

      {/* battle area */}
      <div ref={areaRef} className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#05030f] to-[#0a0f2c]">
        {wave.foes.map((foe) => (
          <motion.button
            key={foe.key}
            initial={{ y: -52 }}
            animate={{ y: h }}
            transition={{ duration: wave.dur, ease: 'linear' }}
            onAnimationComplete={() => foe.isTarget && targetMiss()}
            onClick={(e) => shoot(foe, e)}
            style={{ left: `${foe.x}%` }}
            className="absolute top-0 flex flex-col items-center active:scale-90"
          >
            <span className="text-3xl">🛸</span>
            <span className="-mt-1 rounded-md bg-rose-500/20 px-2 text-sm font-extrabold text-rose-200">{foe.word}</span>
          </motion.button>
        ))}

        {/* explosion */}
        <AnimatePresence>
          {boom && (
            <motion.div
              key={boom.key}
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.36 }}
              style={{ left: boom.x, top: boom.y }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-4xl"
            >
              💥
            </motion.div>
          )}
        </AnimatePresence>

        {/* player ship */}
        <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-4xl">🚀</div>
      </div>
    </div>
  )
}
