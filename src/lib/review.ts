import type { Lesson } from '../types'
import type { SrsCard } from '../store/useGameStore'
import { itemByCardId } from '../data/curriculum'
import { reviewExerciseForWord } from './generateVocab'

// ============================================================
// 错题修复站 — build a review session (Lesson) from due SRS cards.
// Word cards regenerate a vocab drill; item cards fetch the original
// grammar exercise. Plays through the normal lesson engine.
// ============================================================

export function buildReviewLesson(cards: (SrsCard & { id: string })[]): Lesson {
  const exercises = cards
    .map((c) => (c.kind === 'word' ? reviewExerciseForWord(c.ref) : itemByCardId(c.id)))
    .filter((ex) => ex !== null)

  return {
    id: `review-${Date.now()}`,
    title: '错题修复站',
    emoji: '🔧',
    tier: 1,
    skills: ['vocab', 'grammar'],
    exercises,
  }
}
