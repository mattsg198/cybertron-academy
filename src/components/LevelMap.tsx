import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CURRICULUM, lessonOrder, goalOf } from '../data/curriculum'
import { robotById } from '../data/robots'
import { useGameStore } from '../store/useGameStore'
import RobotAvatar from './RobotAvatar'
import AssetImage from './AssetImage'
import type { Lesson, Unit } from '../types'

// ============================================================
// LevelMap — horizontal winding journey (Duolingo-in-landscape).
// Data-driven: every stop is derived from CURRICULUM, so adding a
// sector/lesson in data automatically extends the map.
// ============================================================

type Stop =
  | { kind: 'lesson'; unit: Unit; lesson: Lesson; first: boolean }
  | { kind: 'reward'; unit: Unit }
  | { kind: 'exam'; unit: Unit; lesson: Lesson }
  | { kind: 'prize' }

// Tower-defense-style winding road — a smooth vertical sine path; nodes ride the
// curve and the connector is drawn as a bordered track with a glowing dashed centre.
const PAD = 84 // keep nodes/labels off the edges
const STEP_Y = 110 // vertical gap between stops
const TOP = 72 // top padding
const WAVE_K = 0.62 // how often the road swings left ↔ right

export default function LevelMap({
  onStart,
}: {
  onStart: (unitId: string, lesson: Lesson) => void
}) {
  const results = useGameStore((s) => s.results)
  const unlockedRobots = useGameStore((s) => s.unlockedRobots)
  const isUnlocked = useGameStore((s) => s.isLessonUnlocked)
  const starsFor = useGameStore((s) => s.starsFor)
  const scroller = useRef<HTMLDivElement>(null)

  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? Math.min(window.innerWidth, 1100) : 900,
  )
  useEffect(() => {
    const measure = () => {
      if (scroller.current) setWidth(scroller.current.clientWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [])
  const cx = width / 2
  const amp = Math.max(70, width / 2 - PAD)

  const stops = useMemo<Stop[]>(() => {
    const out: Stop[] = []
    CURRICULUM.forEach((u) => {
      if (u.kind === 'exam') {
        out.push({ kind: 'exam', unit: u, lesson: u.lessons[0] })
      } else {
        u.lessons.forEach((l, li) =>
          out.push({ kind: 'lesson', unit: u, lesson: l, first: li === 0 }),
        )
        out.push({ kind: 'reward', unit: u })
      }
    })
    out.push({ kind: 'prize' })
    return out
  }, [])

  // Nodes ride a smooth vertical sine — organic, tower-defense-like winding road.
  const posOf = (i: number) => ({ x: cx + amp * Math.sin(i * WAVE_K), y: TOP + i * STEP_Y })
  const height = TOP + (stops.length - 1) * STEP_Y + 150

  // current = first unlocked, not-yet-passed lesson
  const currentId = useMemo(() => {
    for (const o of lessonOrder) {
      if (isUnlocked(o.unitId, o.lessonId) && !results[o.lessonId]) return o.lessonId
    }
    return null
  }, [results, isUnlocked])

  // centre the current stop vertically on mount / when it changes
  useEffect(() => {
    const idx = stops.findIndex(
      (s) => (s.kind === 'lesson' || s.kind === 'exam') && s.lesson.id === currentId,
    )
    const el = scroller.current
    if (el && idx >= 0) {
      el.scrollTo({ top: Math.max(0, posOf(idx).y - el.clientHeight / 2), behavior: 'smooth' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, width])

  // smooth curved track through the points (quadratic through each vertex)
  const pathD = useMemo(() => {
    const n = stops.length
    if (!n) return ''
    const pts = stops.map((_, i) => posOf(i))
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < n; i++) {
      const mx = (pts[i - 1].x + pts[i].x) / 2
      const my = (pts[i - 1].y + pts[i].y) / 2
      d += ` Q ${pts[i - 1].x} ${pts[i - 1].y} ${mx} ${my}`
    }
    const last = pts[n - 1]
    d += ` L ${last.x} ${last.y}`
    return d
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, width])

  return (
    <div ref={scroller} className="no-scrollbar relative h-full w-full overflow-y-auto overflow-x-hidden">
      <div className="relative mx-auto" style={{ width, height }}>
        {/* winding track: dark border → road body → soft glow → dashed centre line */}
        <svg className="absolute inset-0" width={width} height={height} fill="none">
          <path d={pathD} stroke="rgba(4,6,20,0.55)" strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD} stroke="#2b356b" strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD} stroke="rgba(0,217,255,0.16)" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathD} stroke="rgba(0,217,255,0.75)" strokeWidth={3} strokeDasharray="2 18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {stops.map((stop, i) => {
          const { x, y } = posOf(i)
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              {stop.kind === 'lesson' && (
                <LessonStop
                  unit={stop.unit}
                  lesson={stop.lesson}
                  first={stop.first}
                  unlocked={isUnlocked(stop.unit.id, stop.lesson.id)}
                  stars={starsFor(stop.lesson.id)}
                  current={stop.lesson.id === currentId}
                  onStart={() => onStart(stop.unit.id, stop.lesson)}
                />
              )}
              {stop.kind === 'reward' && (
                <RewardStop unit={stop.unit} owned={unlockedRobots.includes(stop.unit.rewardRobotId)} />
              )}
              {stop.kind === 'exam' && (
                <ExamStop
                  unlocked={isUnlocked(stop.unit.id, stop.lesson.id)}
                  stars={starsFor(stop.lesson.id)}
                  current={stop.lesson.id === currentId}
                  onStart={() => onStart(stop.unit.id, stop.lesson)}
                />
              )}
              {stop.kind === 'prize' && <PrizeStop />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <div className="mt-1 text-center text-sm leading-none">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'text-energon' : 'text-white/15'}>
          ★
        </span>
      ))}
    </div>
  )
}

function LessonStop({
  unit,
  lesson,
  first,
  unlocked,
  stars,
  current,
  onStart,
}: {
  unit: Unit
  lesson: Lesson
  first: boolean
  unlocked: boolean
  stars: number
  current: boolean
  onStart: () => void
}) {
  const done = stars > 0
  const isBoss = !!lesson.boss
  const mastered = !isBoss && stars >= 3 // 3★ = 已精通（金）
  const accent = isBoss ? '#ff4d6d' : mastered ? '#ffcc33' : unit.color
  return (
    <div className="flex flex-col items-center">
      {/* sector label above the first node of each sector */}
      {first && (
        <div
          className="absolute -top-16 left-1/2 w-44 -translate-x-1/2 rounded-xl px-3 py-2 text-center"
          style={{ background: `${unit.color}22`, border: `1px solid ${unit.color}66` }}
        >
          <div className="text-sm font-black leading-tight">{unit.name}</div>
          <div className="text-[11px] text-white/55">{unit.zh}</div>
        </div>
      )}

      {isBoss && unlocked && (
        <div className="absolute -top-11 z-10 whitespace-nowrap rounded-full border border-[#ff4d6d] bg-gradient-to-r from-[#ff2d55] to-[#ff6b88] px-3 py-1 text-xs font-black text-white">
          ☠️ BOSS · {lesson.boss!.zh ?? lesson.boss!.name}
        </div>
      )}
      {current && !isBoss && (
        <motion.div
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute -top-9 rounded-full bg-energon px-3 py-1 text-xs font-black text-[#1a1300]"
        >
          开始 ▶
        </motion.div>
      )}
      {mastered && <div className="absolute -top-7 text-xl">👑</div>}

      <button
        onClick={unlocked ? onStart : undefined}
        disabled={!unlocked}
        className={`flex items-center justify-center rounded-full border-4 transition ${
          isBoss ? 'h-24 w-24 text-4xl' : 'h-20 w-20 text-3xl'
        } ${current && !isBoss ? 'animate-glow' : ''} ${
          unlocked
            ? 'active:scale-95'
            : 'cursor-not-allowed border-white/10 bg-white/[0.03] opacity-50'
        }`}
        style={
          unlocked
            ? {
                background: done ? accent : isBoss ? 'rgba(255,77,109,0.18)' : 'rgba(255,255,255,0.08)',
                borderColor: current ? '#00d9ff' : done || isBoss ? accent : 'rgba(255,255,255,0.25)',
                boxShadow: isBoss ? '0 0 14px rgba(255,77,109,0.45)' : undefined,
              }
            : undefined
        }
      >
        {!unlocked ? (
          '🔒'
        ) : isBoss ? (
          <AssetImage slot={lesson.boss!.image} emoji={lesson.emoji} sizeClass="text-4xl" />
        ) : (
          lesson.emoji
        )}
      </button>
      {isBoss && unlocked && (
        <div className="mt-1 text-base font-black text-[#ff8fa3]">{lesson.boss!.name}</div>
      )}
      {done ? <Stars n={stars} /> : !isBoss && <div className="mt-1 h-5" />}
      {unlocked && !isBoss && (
        <div className="w-36 text-center leading-snug">
          <div className="truncate text-base font-black text-white/90">{lesson.title}</div>
          <div className="truncate text-xs text-white/55">{goalOf(lesson.id)}</div>
        </div>
      )}
    </div>
  )
}

function RewardStop({ unit, owned }: { unit: Unit; owned: boolean }) {
  const robot = robotById(unit.rewardRobotId)
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-3xl ${
          owned ? 'border-cyber/60 bg-cyber/15' : 'border-white/15 bg-white/5 opacity-60'
        }`}
        title={owned ? robot.name : '击败关底 Boss 解锁'}
      >
        {owned ? <RobotAvatar robot={robot} sizeClass="text-3xl" /> : '🔒'}
      </div>
      <div className="mt-1 w-24 text-center text-[11px] text-white/55">
        {owned ? robot.name : '击败 Boss 解锁'}
      </div>
    </div>
  )
}

function ExamStop({
  unlocked,
  stars,
  current,
  onStart,
}: {
  unlocked: boolean
  stars: number
  current: boolean
  onStart: () => void
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="absolute -top-16 w-48 -translate-y-0 rounded-xl border border-energon/50 bg-energon/10 px-3 py-2 text-center">
        <div className="text-sm font-black text-energon">🏆 KET 模考</div>
        <div className="text-[11px] text-white/55">大关卡 · 银牌兑盲盒</div>
      </div>
      {current && (
        <div className="absolute -top-9 rounded-full bg-energon px-3 py-1 text-xs font-black text-[#1a1300]">
          挑战 ▶
        </div>
      )}
      <button
        onClick={unlocked ? onStart : undefined}
        disabled={!unlocked}
        className={`flex h-24 w-24 items-center justify-center rounded-full border-4 text-4xl transition ${
          current ? 'animate-glow' : ''
        } ${
          unlocked
            ? 'border-energon bg-energon/20 active:scale-95'
            : 'cursor-not-allowed border-white/10 bg-white/[0.03] opacity-50'
        }`}
      >
        {unlocked ? '👾' : '🔒'}
      </button>
      {stars > 0 ? <Stars n={stars} /> : <div className="mt-1 h-5" />}
    </div>
  )
}

function PrizeStop() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-20 w-20 animate-float items-center justify-center rounded-2xl border-2 border-autobot/50 bg-autobot/10 text-4xl">
        🎁
      </div>
      <div className="mt-1 w-28 text-center text-[11px] text-white/55">布鲁可盲盒 端盒</div>
    </div>
  )
}
