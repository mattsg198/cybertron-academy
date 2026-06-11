import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { allItems } from '../../data/curriculum'
import { shuffle } from '../../lib/arcade'
import { sfx } from '../../lib/sfx'
import type { Exercise } from '../../types'

const GAME_SEC = 45
const WRONG_PENALTY = 2

type FB = { before: string; after: string; answer: string; options: string[]; cardId: string; ref: string; topic?: string }
type Round = { sentence: string; isCorrect: boolean; src: FB }

// 🧱 语法防火墙:句子闪现,判断语法对/错。复用 fillBlank 题;判对喂 SRS。
export default function Firewall({ onEnd }: { onEnd: (score: number, correct: number) => void }) {
  const recordAnswer = useGameStore((s) => s.recordAnswer)

  const pool = useMemo<FB[]>(() => {
    const fbs = allItems()
      .filter((it) => it.exercise.type === 'fillBlank')
      .map((it) => {
        const ex = it.exercise as Extract<Exercise, { type: 'fillBlank' }>
        return {
          before: ex.before,
          after: ex.after,
          answer: ex.answer,
          options: ex.options,
          cardId: `${it.lessonId}#${it.index}`,
          ref: it.lessonId,
          topic: it.topic,
        }
      })
    return shuffle(fbs)
  }, [])

  const makeRound = (src: FB): Round => {
    const wrongs = src.options.filter((o) => o !== src.answer)
    const isCorrect = wrongs.length === 0 ? true : Math.random() < 0.5
    const fill = isCorrect ? src.answer : wrongs[Math.floor(Math.random() * wrongs.length)]
    return { sentence: `${src.before}${fill}${src.after}`.trim(), isCorrect, src }
  }

  const idx = useRef(0)
  const correctRef = useRef(0)
  const endedRef = useRef(false)
  const [round, setRound] = useState<Round>(() => makeRound(pool[0]))
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SEC)
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null)
  const [locked, setLocked] = useState(false)

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

  const judge = (saidCorrect: boolean) => {
    if (locked || timeLeft <= 0) return
    const right = saidCorrect === round.isCorrect
    if (right) {
      setScore((s) => s + 10 + combo * 2)
      setCombo((c) => c + 1)
      correctRef.current += 1
      // 判对且句子本身正确 → 强化该语法点
      if (round.isCorrect) {
        recordAnswer({ id: round.src.cardId, kind: 'item', ref: round.src.ref, topic: round.src.topic }, true)
      }
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
      setRound(makeRound(pool[idx.current % pool.length]))
    }, 180)
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

      <div className="flex flex-1 flex-col justify-center">
        <p className="mb-2 text-center text-sm font-bold text-white/50">这句英语对吗?</p>
        <motion.div
          key={idx.current}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-3xl border-2 px-6 py-10 text-center text-3xl font-black leading-snug transition-colors ${
            flash === 'ok'
              ? 'border-emerald-400 bg-emerald-400/10'
              : flash === 'bad'
                ? 'border-rose-400 bg-rose-400/10'
                : 'border-white/15 bg-white/5'
          }`}
        >
          {round.sentence}
        </motion.div>
      </div>

      <div className="mb-6 mt-6 grid grid-cols-2 gap-4">
        <button
          onClick={() => judge(false)}
          className="rounded-2xl border-2 border-rose-400/50 bg-rose-400/10 py-6 text-3xl font-black text-rose-200 active:scale-95"
        >
          ❌ 错
        </button>
        <button
          onClick={() => judge(true)}
          className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-400/10 py-6 text-3xl font-black text-emerald-200 active:scale-95"
        >
          ✅ 对
        </button>
      </div>
    </div>
  )
}
