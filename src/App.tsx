import { useState } from 'react'
import type { Lesson } from './types'
import type { WordPack } from './data/wordbank'
import { unitById } from './data/curriculum'
import { makeVocabLesson } from './lib/generateVocab'
import { buildReviewLesson } from './lib/review'
import { makePlacementLesson, recommendPlacement, type Placement } from './lib/placement'
import { makeSkillLesson, type Skill } from './lib/specialize'
import { useGameStore, dueCards, type GradeTier } from './store/useGameStore'
import TopBar from './components/TopBar'
import LevelMap from './components/LevelMap'
import LessonScreen from './components/LessonScreen'
import ResultScreen from './components/ResultScreen'
import Collection from './components/Collection'
import TrainingBay from './components/TrainingBay'
import ParentCenter from './components/ParentCenter'
import CheckInCard from './components/CheckInCard'
import EyeBreakOverlay, { useEyeBreak } from './components/EyeBreak'
import PlacementResult from './components/PlacementResult'
import TabBar, { Tab } from './components/TabBar'

type View =
  | { name: 'home' }
  | { name: 'lesson'; unitId: string; lesson: Lesson }
  | { name: 'practice'; lesson: Lesson }
  | { name: 'placement'; lesson: Lesson }
  | { name: 'placementResult'; placement: Placement; correct: number; total: number }
  | {
      name: 'result'
      earned: number
      stars: number
      correct: number
      total: number
      newlyUnlocked: string | null
      isExam: boolean
      grade: GradeTier
      newVoucher: 'silver' | 'gold' | null
      fromPractice: boolean
    }

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  const [tab, setTab] = useState<Tab>('map')
  const completeLesson = useGameStore((s) => s.completeLesson)
  const practiceComplete = useGameStore((s) => s.practiceComplete)
  const placeAt = useGameStore((s) => s.placeAt)
  const { resting, endRest } = useEyeBreak()

  const startPlacement = () => setView({ name: 'placement', lesson: makePlacementLesson() })

  const finishPlacement = (correct: number, total: number) => {
    const placement = recommendPlacement(correct, total)
    placeAt(placement.unitId)
    setView({ name: 'placementResult', placement, correct, total })
  }

  const startLesson = (unitId: string, lesson: Lesson) =>
    setView({ name: 'lesson', unitId, lesson })

  const startVocab = (pack: WordPack) =>
    setView({ name: 'practice', lesson: makeVocabLesson(pack) })

  const startReview = () => {
    const cards = dueCards(useGameStore.getState().srs, 12)
    if (cards.length) setView({ name: 'practice', lesson: buildReviewLesson(cards) })
  }

  const startSkill = (skill: Skill) => {
    const lesson = makeSkillLesson(skill)
    if (lesson) setView({ name: 'practice', lesson })
  }

  const finishLesson = (correct: number, total: number) => {
    if (view.name !== 'lesson') return
    const isExam = unitById(view.unitId)?.kind === 'exam'
    const res = completeLesson(view.unitId, view.lesson.id, correct, total, isExam)
    setView({
      name: 'result',
      earned: res.earned,
      stars: res.stars,
      correct,
      total,
      newlyUnlocked: res.newlyUnlocked,
      isExam: !!isExam,
      grade: res.grade,
      newVoucher: res.newVoucher,
      fromPractice: false,
    })
  }

  const finishPractice = (correct: number, total: number) => {
    const res = practiceComplete(correct, total)
    setView({
      name: 'result',
      earned: res.earned,
      stars: res.stars,
      correct,
      total,
      newlyUnlocked: null,
      isExam: false,
      grade: 'bronze',
      newVoucher: null,
      fromPractice: true,
    })
  }

  // Full-screen flows take over entirely.
  const content = (() => {
  if (view.name === 'lesson') {
    const unit = unitById(view.unitId)
    const boss =
      unit?.kind === 'exam' ? { name: unit.name, emoji: '👾' } : view.lesson.boss
    return (
      <LessonScreen
        lesson={view.lesson}
        boss={boss}
        paused={resting}
        onFinish={finishLesson}
        onQuit={() => setView({ name: 'home' })}
      />
    )
  }
  if (view.name === 'practice') {
    return (
      <LessonScreen
        lesson={view.lesson}
        paused={resting}
        onFinish={finishPractice}
        onQuit={() => setView({ name: 'home' })}
      />
    )
  }
  if (view.name === 'placement') {
    return (
      <LessonScreen
        lesson={view.lesson}
        paused={resting}
        onFinish={finishPlacement}
        onQuit={() => setView({ name: 'home' })}
      />
    )
  }
  if (view.name === 'placementResult') {
    return (
      <PlacementResult
        placement={view.placement}
        correct={view.correct}
        total={view.total}
        onContinue={() => {
          setTab('map')
          setView({ name: 'home' })
        }}
      />
    )
  }
  if (view.name === 'result') {
    return (
      <ResultScreen
        earned={view.earned}
        stars={view.stars}
        correct={view.correct}
        total={view.total}
        newlyUnlocked={view.newlyUnlocked}
        isExam={view.isExam}
        grade={view.grade}
        newVoucher={view.newVoucher}
        onContinue={() => {
          if (view.fromPractice) setTab('training')
          setView({ name: 'home' })
        }}
      />
    )
  }

  return (
    <div className="flex h-dvh flex-col">
      <TopBar onOpenCollection={() => setTab('garage')} />

      <main className="flex flex-1 flex-col overflow-hidden pb-20">
        {tab === 'map' && (
          <div className="flex flex-1 flex-col">
            <div className="px-4 pt-2">
              <CheckInCard />
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <LevelMap onStart={startLesson} />
            </div>
          </div>
        )}
        {tab === 'garage' && <Collection />}
        {tab === 'training' && (
          <TrainingBay
            onStartVocab={startVocab}
            onStartReview={startReview}
            onStartSkill={startSkill}
          />
        )}
        {tab === 'parent' && <ParentCenter onStartPlacement={startPlacement} />}
      </main>

      <TabBar active={tab} onChange={setTab} />
    </div>
  )
  })()

  return (
    <>
      {content}
      {resting && <EyeBreakOverlay onDone={endRest} />}
    </>
  )
}
