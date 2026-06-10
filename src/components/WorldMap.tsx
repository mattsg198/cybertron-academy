import { motion } from 'framer-motion'
import { CURRICULUM } from '../data/curriculum'
import { robotById } from '../data/robots'
import { useGameStore } from '../store/useGameStore'
import type { Lesson, Unit } from '../types'
import RobotAvatar from './RobotAvatar'

const SKILL_ICON: Record<string, string> = {
  listen: '👂',
  speak: '🗣️',
  read: '📖',
  vocab: '🔤',
  grammar: '🧩',
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-xs tracking-tight">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'text-energon' : 'text-white/15'}>
          ★
        </span>
      ))}
    </span>
  )
}

function LessonNode({
  unit,
  lesson,
  onStart,
}: {
  unit: Unit
  lesson: Lesson
  onStart: () => void
}) {
  const unlocked = useGameStore((s) => s.isLessonUnlocked(unit.id, lesson.id))
  const stars = useGameStore((s) => s.starsFor(lesson.id))
  const done = stars > 0

  return (
    <button
      onClick={unlocked ? onStart : undefined}
      disabled={!unlocked}
      className={`group relative flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${
        unlocked
          ? 'border-white/15 bg-white/5 hover:border-cyber hover:bg-white/10 active:scale-[0.99]'
          : 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50'
      }`}
    >
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-4xl"
        style={{ background: done ? unit.color : 'rgba(255,255,255,0.06)' }}
      >
        {unlocked ? lesson.emoji : '🔒'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold">{lesson.title}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/60">
            L{lesson.tier}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {lesson.skills.map((s) => (
            <span key={s} title={s} className="text-lg">
              {SKILL_ICON[s]}
            </span>
          ))}
          <span className="ml-auto">
            <Stars n={stars} />
          </span>
        </div>
      </div>
    </button>
  )
}

function UnitBlock({
  unit,
  onStart,
}: {
  unit: Unit
  onStart: (l: Lesson) => void
}) {
  const complete = useGameStore((s) => s.isUnitComplete(unit.id))
  const reward = robotById(unit.rewardRobotId)
  return (
    <section className="mb-8">
      <div
        className="mb-3 flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: `${unit.color}22`, borderLeft: `5px solid ${unit.color}` }}
      >
        <div className="flex-1">
          <h2 className="text-lg font-black">{unit.name}</h2>
          <p className="text-sm text-white/60">{unit.zh}</p>
        </div>
        <div
          className={`flex flex-col items-center rounded-xl px-3 py-1.5 text-center ${
            complete ? 'bg-emerald-400/20' : 'bg-white/5'
          }`}
          title={`Reward: ${reward.name}`}
        >
          <span className="text-3xl">
            {complete ? <RobotAvatar robot={reward} sizeClass="text-3xl" /> : '🎁'}
          </span>
          <span className="text-[10px] text-white/60">
            {complete ? 'Unlocked!' : reward.name}
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {unit.lessons.map((l) => (
          <LessonNode key={l.id} unit={unit} lesson={l} onStart={() => onStart(l)} />
        ))}
      </div>
    </section>
  )
}

export default function WorldMap({
  onStart,
}: {
  onStart: (unitId: string, lesson: Lesson) => void
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-7">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3 rounded-3xl border border-cyber/30 bg-cyber/5 p-4"
      >
        <span className="animate-float text-5xl">🤖</span>
        <div>
          <p className="font-black text-cyber">Welcome to Cybertron Academy!</p>
          <p className="text-sm text-white/70">
            学英语，集齐汽车人，打败威震天！Roll out! 🚗💨
          </p>
        </div>
      </motion.div>

      {CURRICULUM.map((u) => (
        <UnitBlock key={u.id} unit={u} onStart={(l) => onStart(u.id, l)} />
      ))}
    </main>
  )
}
