import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { BossInfo, Exercise, Lesson, SrsRef } from '../types'
import { useGameStore } from '../store/useGameStore'
import { goalOf } from '../data/curriculum'
import { sfx } from '../lib/sfx'
import WordPicture from './exercises/WordPicture'
import ListenChoose from './exercises/ListenChoose'
import SpeakWord from './exercises/SpeakWord'
import SpellWord from './exercises/SpellWord'
import SentenceBuild from './exercises/SentenceBuild'
import FillBlank from './exercises/FillBlank'
import ReadComprehend from './exercises/ReadComprehend'
import WordMatch from './exercises/WordMatch'
import { ExProps } from './exercises/shared'
import RobotAvatar from './RobotAvatar'
import { robotById } from '../data/robots'

const INSPECTOR = robotById('tr3')

const MAX_CORES = 5
const BOSS_TIME = 20 // seconds per question in a boss battle

export type { BossInfo }

function renderExercise(ex: Exercise, props: Omit<ExProps<never>, 'ex'>) {
  switch (ex.type) {
    case 'wordPicture':
      return <WordPicture ex={ex} {...props} />
    case 'listen':
      return <ListenChoose ex={ex} {...props} />
    case 'speak':
      return <SpeakWord ex={ex} {...props} />
    case 'spell':
      return <SpellWord ex={ex} {...props} />
    case 'sentenceBuild':
      return <SentenceBuild ex={ex} {...props} />
    case 'fillBlank':
      return <FillBlank ex={ex} {...props} />
    case 'read':
      return <ReadComprehend ex={ex} {...props} />
    case 'wordMatch':
      return <WordMatch ex={ex} {...props} />
  }
}

// 汽车人探长 personality — encouraging, detective-flavoured.
const CHEERS = ['探长：线索正确！🎉', '破案了，干得漂亮！⭐', 'Energon +1 ⚡', '你真有侦探天赋！🚀', 'Nice work, partner! 💪']
const NUDGES = ['探长：再想想，你能行 💡', '差一点，换条线索 🔧', '别急，我们一起破案 🛠️']

export default function LessonScreen({
  lesson,
  boss,
  onFinish,
  onQuit,
}: {
  lesson: Lesson
  boss?: BossInfo
  onFinish: (correct: number, total: number) => void
  onQuit: () => void
}) {
  // Re-attempt wrong items at the end so the lesson is always completable.
  const [queue, setQueue] = useState<Exercise[]>(lesson.exercises)
  const [idx, setIdx] = useState(0)
  const [cores, setCores] = useState(MAX_CORES)
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [hitFx, setHitFx] = useState<{ n: number; kind: 'hit' | 'crit' | 'counter' } | null>(null)
  const [combo, setCombo] = useState(0)
  const [showIntro, setShowIntro] = useState(!!boss?.intro)
  // Score by FIRST-attempt accuracy (requeued retries don't inflate the grade).
  const attempted = useRef(new Set<Exercise>())
  const [firstTry, setFirstTry] = useState(0)
  const total = lesson.exercises.length
  const bossHp = Math.max(0, 1 - correctCount / total)

  // SRS: each item trains a card (a word or a grammar item).
  const recordAnswer = useGameStore((s) => s.recordAnswer)
  // Time on task — measure mount→unmount (covers finish AND quit).
  const logStudyTime = useGameStore((s) => s.logStudyTime)
  useEffect(() => {
    const t0 = Date.now()
    return () => logStudyTime((Date.now() - t0) / 1000)
  }, [logStudyTime])
  const origIndex = useMemo(
    () => new Map(lesson.exercises.map((e, i) => [e, i] as const)),
    [lesson],
  )
  const cardFor = (e: Exercise): SrsRef | null => {
    if (e.card) return e.card
    if (e.type === 'wordMatch') return null // covers many words; not one card
    const i = origIndex.get(e)
    return i === undefined
      ? null
      : { id: `${lesson.id}#${i}`, kind: 'item', ref: lesson.title, topic: lesson.topic }
  }

  const cheer = useMemo(
    () => CHEERS[Math.floor(Math.random() * CHEERS.length)],
    [idx, answered],
  )
  const nudge = useMemo(
    () => NUDGES[Math.floor(Math.random() * NUDGES.length)],
    [idx, answered],
  )

  const ex = queue[idx]
  const progress = Math.min(idx / queue.length, 1)

  // Boss pre-battle story screen.
  if (showIntro && boss?.intro) {
    return (
      <div className="mx-auto flex h-dvh max-w-2xl flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="text-7xl">{boss.emoji}</div>
        <h1 className="text-3xl font-black text-[#ff6b88]">
          ⚔️ 关底 Boss · {boss.zh ?? boss.name}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-white/85">{boss.intro}</p>
        <p className="text-sm text-white/45">每题限时 {BOSS_TIME} 秒，答错或超时会扣电池 🔋</p>
        <button
          onClick={() => setShowIntro(false)}
          className="rounded-2xl bg-[#ff2d55] px-12 py-3 text-xl font-black text-white active:scale-95"
        >
          开战 ▶
        </button>
        <button onClick={onQuit} className="text-sm text-white/40 hover:text-white/70">
          撤退
        </button>
      </div>
    )
  }

  const handleDone = (correct: boolean) => {
    const isFirstAttempt = !attempted.current.has(ex)
    attempted.current.add(ex)
    setAnswered(true)
    setLastCorrect(correct)
    if (correct) {
      setCorrectCount((c) => c + 1)
      setCombo((c) => c + 1)
      if (isFirstAttempt) setFirstTry((f) => f + 1)
    } else {
      setCores((c) => Math.max(0, c - 1))
      setQueue((q) => [...q, ex]) // requeue for a retry
      setCombo(0)
    }
    if (isFirstAttempt) {
      const card = cardFor(ex)
      if (card) recordAnswer(card, correct) // 错题本 + SRS
    }
    if (boss) {
      const kind = correct ? (Math.random() < 0.3 ? 'crit' : 'hit') : 'counter'
      setHitFx((f) => ({ n: (f?.n ?? 0) + 1, kind }))
    }
  }

  // Boss battles: a story intro, then a per-question countdown.
  const [timeLeft, setTimeLeft] = useState(BOSS_TIME)
  const [timedOut, setTimedOut] = useState(false)
  useEffect(() => {
    if (boss) setTimeLeft(BOSS_TIME)
  }, [idx, boss])
  useEffect(() => {
    if (!boss || answered || showIntro) return
    if (timeLeft <= 0) {
      setTimedOut(true)
      handleDone(false)
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boss, answered, timeLeft, showIntro])

  const next = () => {
    setAnswered(false)
    setTimedOut(false)
    if (idx + 1 >= queue.length) {
      sfx.levelUp()
      onFinish(firstTry, total) // grade by first-attempt accuracy
      return
    }
    setIdx((i) => i + 1)
  }

  return (
    <div className="mx-auto flex h-dvh max-w-4xl flex-col px-6 pt-4">
      {/* boss battle banner */}
      {boss && (
        <div className="mb-3 flex items-center gap-4 rounded-2xl border-2 border-autobot/40 bg-autobot/10 px-4 py-3">
          <motion.div
            key={hitFx?.n ?? 0}
            initial={{ x: 0 }}
            animate={hitFx ? { x: [0, -8, 8, -5, 5, 0], rotate: [0, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="text-5xl"
          >
            {bossHp <= 0 ? '💥' : boss.emoji}
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black">{boss.name}</span>
              {hitFx && (
                <motion.span
                  key={hitFx.n}
                  initial={{ y: 0, opacity: 0, scale: 0.6 }}
                  animate={{ y: -6, opacity: 1, scale: 1 }}
                  className={`text-sm font-black ${
                    hitFx.kind === 'crit'
                      ? 'text-energon'
                      : hitFx.kind === 'counter'
                        ? 'text-rose-300'
                        : 'text-emerald-300'
                  }`}
                >
                  {hitFx.kind === 'crit' ? '⚡ 暴击!' : hitFx.kind === 'counter' ? '👾 反击!' : '💥 命中!'}
                </motion.span>
              )}
            </div>
            <div className="mt-1 h-4 overflow-hidden rounded-full border border-white/10 bg-black/40">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
                animate={{ width: `${bossHp * 100}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* header: quit + progress + cores */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onQuit}
          className="text-2xl text-white/50 hover:text-white"
          aria-label="Quit"
        >
          ✕
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyber to-energon"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="flex items-center gap-0.5 text-lg">
          {Array.from({ length: MAX_CORES }).map((_, i) => (
            <span key={i} className={i < cores ? '' : 'opacity-20 grayscale'}>
              🔋
            </span>
          ))}
        </div>
      </div>

      {/* non-blocking lesson title + goal */}
      {!boss && (
        <div className="mb-3 -mt-2 text-center">
          <span className="text-base font-black">{lesson.title}</span>
          {goalOf(lesson.id) && <span className="ml-2 text-sm text-white/50">· {goalOf(lesson.id)}</span>}
        </div>
      )}

      {/* boss per-question countdown */}
      {boss && (
        <div className="mb-4 -mt-2">
          <div className="mb-1 flex items-center justify-between text-xs font-black">
            <span className={timeLeft <= 5 && !answered ? 'text-rose-300' : 'text-white/55'}>
              ⏱️ 限时挑战
            </span>
            <span className={timeLeft <= 5 && !answered ? 'text-rose-300' : 'text-white/55'}>
              {answered ? '—' : `${timeLeft}s`}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-linear"
              style={{
                width: `${(Math.max(0, timeLeft) / BOSS_TIME) * 100}%`,
                background: timeLeft <= 5 ? '#ff4d6d' : '#00d9ff',
              }}
            />
          </div>
        </div>
      )}

      {/* exercise body — vertically centred so it sits in one landscape screen */}
      <div className="no-scrollbar flex flex-1 flex-col justify-center overflow-y-auto pb-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {renderExercise(ex, { done: answered, onDone: handleDone })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* tap anywhere to continue once answered (Duolingo-style) */}
      {answered && (
        <button
          aria-label="Continue"
          onClick={next}
          className="fixed inset-0 z-30 cursor-pointer"
        />
      )}

      {/* feedback footer */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className={`fixed inset-x-0 bottom-0 border-t-2 px-4 py-5 ${
              lastCorrect
                ? 'border-emerald-400/40 bg-emerald-500/15 backdrop-blur'
                : 'border-rose-400/40 bg-rose-500/15 backdrop-blur'
            }`}
          >
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <RobotAvatar robot={INSPECTOR} sizeClass="text-4xl" />
                <p className="text-lg font-extrabold">
                  {lastCorrect ? cheer : timedOut ? '⏰ 时间到！探长：手速再快点！' : nudge}
                </p>
                {lastCorrect && combo >= 2 && (
                  <motion.span
                    key={combo}
                    initial={{ scale: 0.5, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="rounded-full bg-spark/20 px-3 py-1 text-sm font-black text-spark"
                  >
                    🔥 连击 x{combo}
                  </motion.span>
                )}
              </div>
              <button
                onClick={next}
                className={`rounded-2xl px-8 py-3 text-lg font-extrabold text-black ${
                  lastCorrect ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              >
                {idx + 1 >= queue.length ? 'Finish' : 'Continue'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
