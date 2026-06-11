import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { arcadeWords, pick, shuffle } from '../../lib/arcade'
import { sfx } from '../../lib/sfx'
import type { WordEntry } from '../../data/wordbank'

const GAME_SEC = 45
const LANES = [12, 35, 58, 78] // 车道(百分比),不重叠
const clamp = (v: number) => Math.max(5, Math.min(95, v))

type Foe = { key: number; word: string; x: number; isTarget: boolean; delay: number }
type Wave = { target: WordEntry; foes: Foe[]; dur: number }

// 🚀 飞机射击:击落带目标词的敌机。点击发射;电脑上 ← → 移动 + 空格发射。判对喂 SRS。
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
  const comboRef = useRef(0)
  const timeLeftRef = useRef(GAME_SEC)
  const waveRef = useRef<Wave | null>(null)
  const shipXRef = useRef(50)

  const makeWave = (i: number): Wave => {
    resolved.current = false
    const target = pool[i % pool.length]
    const others = pick(pool.filter((w) => w.word !== target.word && w.zh !== target.zh), 3)
    const items = shuffle([{ w: target, t: true }, ...others.map((w) => ({ w, t: false }))])
    const lanes = shuffle(LANES)
    const foes = items.map((o, k) => ({
      key: keyRef.current++,
      word: o.w.word,
      x: lanes[k],
      isTarget: o.t,
      delay: k * 0.55, // 错峰先后出现
    }))
    const dur = Math.max(2.8, 4.8 - scoreRef.current / 900) // 整体放慢
    return { target, foes, dur }
  }

  const [wave, setWave] = useState<Wave>(() => makeWave(0))
  waveRef.current = wave
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [shipX, setShipX] = useState(50)
  const [timeLeft, setTimeLeft] = useState(GAME_SEC)
  const [boom, setBoom] = useState<{ key: number; x: number; y: number } | null>(null)
  const [laser, setLaser] = useState<{ key: number; x: number } | null>(null)

  useEffect(() => {
    timeLeftRef.current = timeLeft
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

  const resolveHit = (foe: Foe, px: number, py: number) => {
    if (resolved.current || timeLeftRef.current <= 0) return
    setBoom({ key: keyRef.current++, x: px, y: py })
    setTimeout(() => setBoom(null), 360)
    if (foe.isTarget) {
      resolved.current = true
      const gain = 10 + comboRef.current * 2
      scoreRef.current += gain
      setScore(scoreRef.current)
      comboRef.current += 1
      setCombo(comboRef.current)
      correctRef.current += 1
      recordAnswer({ id: `w:${foe.word}`, kind: 'word', ref: foe.word }, true)
      sfx.transform()
      next()
    } else {
      comboRef.current = 0
      setCombo(0)
      setTimeLeft((s) => Math.max(0, s - 2))
      sfx.wrong()
    }
  }

  const targetMiss = () => {
    if (resolved.current || timeLeftRef.current <= 0) return
    resolved.current = true
    comboRef.current = 0
    setCombo(0)
    sfx.wrong()
    next()
  }

  const tap = (foe: Foe, e: React.MouseEvent) => {
    const rect = areaRef.current?.getBoundingClientRect()
    resolveHit(foe, rect ? e.clientX - rect.left : 0, rect ? e.clientY - rect.top : 0)
  }

  // —— 键盘:← → 移动,空格发射(命中战机所在列最近的敌机) ——
  useEffect(() => {
    const fire = () => {
      const w = waveRef.current
      const rect = areaRef.current?.getBoundingClientRect()
      if (!w || !rect) return
      setLaser({ key: keyRef.current++, x: (rect.width * shipXRef.current) / 100 })
      setTimeout(() => setLaser(null), 180)
      let best: Foe | null = null
      let bestD = 16 // 命中容差(百分比)
      for (const f of w.foes) {
        const d = Math.abs(f.x - shipXRef.current)
        if (d < bestD) {
          bestD = d
          best = f
        }
      }
      if (best) resolveHit(best, (rect.width * best.x) / 100, rect.height * 0.32)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setShipX((x) => {
          const n = clamp(x - 7)
          shipXRef.current = n
          return n
        })
      } else if (e.key === 'ArrowRight') {
        setShipX((x) => {
          const n = clamp(x + 7)
          shipXRef.current = n
          return n
        })
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        fire()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pctTime = (timeLeft / GAME_SEC) * 100

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-6 pt-5">
      <div className="mb-3 flex items-center gap-4">
        <div className="text-lg font-black text-energon">⚡{score}</div>
        {combo >= 2 && <div className="rounded-full bg-spark/20 px-2 py-0.5 text-sm font-black text-spark">🔥x{combo}</div>}
        <div className="ml-auto text-sm font-black tabular-nums text-white/70">{timeLeft}s</div>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-[width] duration-1000 ease-linear" style={{ width: `${pctTime}%`, background: timeLeft <= 8 ? '#ff4d6d' : '#00d9ff' }} />
      </div>

      <div className="text-center">
        <span className="text-sm text-white/50">🎯 击落:</span>{' '}
        {wave.target.emoji && <span className="text-2xl">{wave.target.emoji}</span>}{' '}
        <span className="text-2xl font-black">{wave.target.zh}</span>
      </div>
      <div className="mb-2 text-center text-[11px] text-white/40">💻 ← → 移动 · 空格发射　📱 直接点敌机</div>

      <div ref={areaRef} className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#05030f] to-[#0a0f2c]">
        {wave.foes.map((foe) => (
          <motion.button
            key={foe.key}
            initial={{ y: -52 }}
            animate={{ y: h }}
            transition={{ duration: wave.dur, delay: foe.delay, ease: 'linear' }}
            onAnimationComplete={() => foe.isTarget && targetMiss()}
            onClick={(e) => tap(foe, e)}
            style={{ left: `${foe.x}%` }}
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center active:scale-90"
          >
            <span className="text-3xl">🛸</span>
            <span className="-mt-1 rounded-md bg-rose-500/20 px-2 text-sm font-extrabold text-rose-200">{foe.word}</span>
          </motion.button>
        ))}

        {/* laser beam */}
        <AnimatePresence>
          {laser && (
            <motion.div
              key={laser.key}
              initial={{ opacity: 0.9, scaleY: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ left: laser.x }}
              className="pointer-events-none absolute bottom-8 top-0 w-1 -translate-x-1/2 bg-gradient-to-t from-cyber to-transparent"
            />
          )}
        </AnimatePresence>

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
        <motion.div
          animate={{ left: `${shipX}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="pointer-events-none absolute bottom-1 -translate-x-1/2 text-4xl"
        >
          🚀
        </motion.div>
      </div>
    </div>
  )
}
