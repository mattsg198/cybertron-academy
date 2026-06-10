import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Exercise } from '../../types'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'
import { ExProps, Prompt } from './shared'

type T = Extract<Exercise, { type: 'wordMatch' }>
type Side = 'L' | 'R'

function shuffle<X>(arr: X[]): X[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function WordMatch({ ex, done, onDone }: ExProps<T>) {
  // each pair has a stable id = its index in ex.pairs
  const left = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ pid: i, text: p.en }))), [ex])
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ pid: i, text: p.cn }))), [ex])

  const [sel, setSel] = useState<{ side: Side; pid: number } | null>(null)
  const [cleared, setCleared] = useState<number[]>([])
  const [wrong, setWrong] = useState<number[]>([]) // pids flashing red

  const tap = (side: Side, pid: number) => {
    if (done || cleared.includes(pid)) return
    if (side === 'L') speak(ex.pairs[pid].en)
    sfx.tap()

    if (!sel || sel.side === side) {
      setSel({ side, pid })
      return
    }
    // tapped the opposite column
    if (sel.pid === pid) {
      const next = [...cleared, pid]
      setCleared(next)
      setSel(null)
      sfx.correct()
      if (next.length === ex.pairs.length) {
        setTimeout(() => onDone(true), 250)
      }
    } else {
      const bad = [sel.pid, pid]
      setWrong(bad)
      setSel(null)
      sfx.wrong()
      setTimeout(() => setWrong([]), 480)
    }
  }

  const tile = (side: Side, pid: number, text: string) => {
    const isCleared = cleared.includes(pid)
    const isSel = sel?.side === side && sel.pid === pid
    const isWrong = wrong.includes(pid)
    return (
      <button
        key={`${side}${pid}`}
        onClick={() => tap(side, pid)}
        disabled={done || isCleared}
        className={`h-16 w-full rounded-2xl border-2 px-3 text-lg font-bold transition ${
          isCleared
            ? 'pointer-events-none border-transparent bg-transparent opacity-0'
            : isWrong
              ? 'border-rose-400 bg-rose-400/20 text-rose-100'
              : isSel
                ? 'border-cyber bg-cyber/20 text-white scale-[1.03]'
                : 'border-white/20 bg-white/8 hover:border-cyber/60 active:scale-95'
        }`}
      >
        {text}
      </button>
    )
  }

  return (
    <div>
      <Prompt>
        <span className="flex items-center gap-3">
          点一对，配上就消除！ <span className="text-base text-white/50">Match the pairs</span>
        </span>
      </Prompt>

      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">{left.map((t) => tile('L', t.pid, t.text))}</div>
        <div className="flex flex-col gap-3">{right.map((t) => tile('R', t.pid, t.text))}</div>
      </div>

      <motion.p
        key={cleared.length}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-5 text-center font-bold text-energon"
      >
        {cleared.length}/{ex.pairs.length} 已配对 ⚡
      </motion.p>
    </div>
  )
}
