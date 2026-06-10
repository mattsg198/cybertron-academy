import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const LIMIT_SEC = 15 * 60 // 连续用眼 15 分钟提醒
const REST_SEC = 20 // 休息时长（20-20-20 法则：看 20 英尺外 20 秒）

/** Tracks visible on-task time; flips `resting` true every 15 min. */
export function useEyeBreak() {
  const [resting, setResting] = useState(false)
  const elapsed = useRef(0)
  const restingRef = useRef(false)
  restingRef.current = resting
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible' || restingRef.current) return
      elapsed.current += 1
      if (elapsed.current >= LIMIT_SEC) {
        elapsed.current = 0
        setResting(true)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return { resting, endRest: () => setResting(false) }
}

/** Full-screen calm rest prompt with a look-away countdown. */
export default function EyeBreakOverlay({ onDone }: { onDone: () => void }) {
  const [left, setLeft] = useState(REST_SEC)
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  const done = left <= 0

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-[#06091f]/97 px-8 text-center backdrop-blur">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        className="text-7xl"
      >
        👀
      </motion.div>
      <h1 className="text-3xl font-black text-cyber">护眼时间到啦！</h1>
      <p className="max-w-md text-lg leading-relaxed text-white/80">
        抬起头,看看窗外或 6 米以外的远处,让眼睛放松一下~
        <br />
        探长也要保护好你的眼睛,才能继续破案！
      </p>
      <div className="text-6xl font-black tabular-nums text-energon">{Math.max(0, left)}</div>
      <button
        onClick={onDone}
        disabled={!done}
        className={`rounded-2xl px-10 py-3 text-xl font-black transition ${
          done ? 'bg-cyber text-black active:scale-95' : 'bg-white/10 text-white/40'
        }`}
      >
        {done ? '我休息好了 ▶' : '请先看看远处…'}
      </button>
      <button onClick={onDone} className="text-sm text-white/35 hover:text-white/60">
        家长跳过
      </button>
    </div>
  )
}
