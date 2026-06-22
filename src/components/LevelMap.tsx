import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CURRICULUM, lessonOrder } from '../data/curriculum'
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

// Tower-defense-style winding road — multi-column serpentine (wide, many nodes
// per row), connector drawn as a bordered track with smooth U-turns + dashed centre.
const PAD = 72 // keep nodes off the edges
const ROW_H = 116 // vertical gap between rows
const TOP = 84 // top padding (room for sector banner)
const colsFor = (w: number) => (w >= 1040 ? 6 : w >= 820 ? 5 : w >= 560 ? 4 : 3)

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
  const COLS = colsFor(width)
  const COL_W = (width - PAD * 2) / Math.max(1, COLS - 1)

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

  // Serpentine grid: each row fills left→right then right→left (wide, many nodes/row).
  const cells = useMemo(() => {
    const out: { col: number; row: number }[] = []
    let col = 0
    let row = 0
    let dir = 1
    stops.forEach(() => {
      out.push({ col, row })
      const atEdge = (dir === 1 && col >= COLS - 1) || (dir === -1 && col <= 0)
      if (atEdge) {
        row += 1
        dir = -dir // drop down, then snake back the other way
      } else {
        col += dir
      }
    })
    return out
  }, [stops, COLS])

  const rowsCount = (cells[cells.length - 1]?.row ?? 0) + 1
  const height = TOP + (rowsCount - 1) * ROW_H + 120
  const posOf = (i: number) => ({ x: PAD + cells[i].col * COL_W, y: TOP + cells[i].row * ROW_H })

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
  }, [currentId, cells, width])

  // smooth-track builder (quadratic through each vertex), 0..to
  const buildPath = (to: number) => {
    if (to <= 0) {
      const p = posOf(0)
      return `M ${p.x} ${p.y}`
    }
    const p0 = posOf(0)
    let d = `M ${p0.x} ${p0.y}`
    for (let i = 1; i <= to; i++) {
      const q = posOf(i - 1)
      const p = posOf(i)
      d += ` Q ${q.x} ${q.y} ${(q.x + p.x) / 2} ${(q.y + p.y) / 2}`
    }
    const last = posOf(to)
    d += ` L ${last.x} ${last.y}`
    return d
  }
  // progress frontier = the current (first unlocked, not-done) stop
  const currentIdx = useMemo(() => {
    const i = stops.findIndex(
      (s) => (s.kind === 'lesson' || s.kind === 'exam') && s.lesson.id === currentId,
    )
    return i < 0 ? stops.length - 1 : i
  }, [stops, currentId])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fullPath = useMemo(() => buildPath(stops.length - 1), [cells, width])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const donePath = useMemo(() => buildPath(currentIdx), [cells, width, currentIdx])

  return (
    <div ref={scroller} className="no-scrollbar relative h-full w-full overflow-y-auto overflow-x-hidden">
      <div className="relative mx-auto" style={{ width, height }}>
        {/* faint cyber-grid backdrop + winding track */}
        <svg className="absolute inset-0" width={width} height={height} fill="none">
          <defs>
            <pattern id="cybergrid" width="46" height="46" patternUnits="userSpaceOnUse">
              <path d="M46 0 H0 V46" fill="none" stroke="rgba(120,160,255,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x={0} y={0} width={width} height={height} fill="url(#cybergrid)" />
          {/* outer border (full) */}
          <path d={fullPath} stroke="rgba(4,6,20,0.55)" strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" />
          {/* dim/locked road (full) */}
          <path d={fullPath} stroke="#222a4e" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
          {/* completed road — lit gold (up to current) */}
          <path d={donePath} stroke="#c79a32" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
          <path d={donePath} stroke="rgba(255,211,78,0.25)" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
          {/* centre dashes: faint over locked, bright gold over completed */}
          <path d={fullPath} stroke="rgba(130,150,210,0.22)" strokeWidth={2.5} strokeDasharray="2 18" strokeLinecap="round" strokeLinejoin="round" />
          <path d={donePath} stroke="rgba(255,226,150,0.95)" strokeWidth={2.5} strokeDasharray="2 18" strokeLinecap="round" strokeLinejoin="round" />
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
  return (
    <div className="flex flex-col items-center">
      {/* sector banner above the first node of each sector */}
      {first && (
        <div
          className="absolute -top-14 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5"
          style={{ background: '#0b1230', border: `1.5px solid ${unit.color}`, boxShadow: `0 0 12px ${unit.color}55` }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: unit.color }} />
          <span className="text-sm font-black" style={{ color: unit.color }}>{unit.name}</span>
          <span className="text-[11px] text-white/45">{unit.zh}</span>
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

      {isBoss ? (
        <button
          onClick={unlocked ? onStart : undefined}
          disabled={!unlocked}
          className={`flex h-24 w-24 items-center justify-center rounded-full border-4 text-4xl transition ${
            unlocked ? 'active:scale-95' : 'cursor-not-allowed border-white/10 bg-white/[0.03] opacity-50'
          }`}
          style={
            unlocked
              ? { background: 'rgba(255,77,109,0.18)', borderColor: '#ff4d6d', boxShadow: '0 0 14px rgba(255,77,109,0.5)' }
              : undefined
          }
        >
          {unlocked ? <AssetImage slot={lesson.boss!.image} emoji={lesson.emoji} sizeClass="text-4xl" /> : '🔒'}
        </button>
      ) : !unlocked ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/10 bg-white/[0.03] text-2xl opacity-50">
          🔒
        </div>
      ) : (
        <button
          onClick={onStart}
          className={`flex h-16 w-16 items-center justify-center rounded-full transition active:scale-95 ${current ? 'animate-glow' : ''}`}
          style={{
            boxShadow: mastered
              ? '0 0 16px rgba(255,204,78,0.8)'
              : done
                ? `0 0 10px ${unit.color}66`
                : undefined,
          }}
        >
          <AssetImage slot={`minions/${unit.id}.png`} emoji={lesson.emoji} sizeClass="text-5xl" />
        </button>
      )}
      {done && <Stars n={stars} />}
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
