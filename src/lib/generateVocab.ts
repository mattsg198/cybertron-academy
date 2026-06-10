import type { Exercise, Lesson, SrsRef } from '../types'
import { WORD_PACKS, type WordEntry, type WordPack } from '../data/wordbank'

// ============================================================
// Vocabulary generator — turns word entries into playable
// exercises (with SRS word-cards), reusing existing exercise types.
// ============================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const pick = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n)

const wordCard = (w: WordEntry, topic: string): SrsRef => ({
  id: `w:${w.word}`,
  kind: 'word',
  ref: w.word,
  topic,
})

/** A single recognition/spell exercise for one word (used by drills & review). */
export function wordExercise(target: WordEntry, pack: WordPack): Exercise {
  const emojiWords = pack.words.filter((w) => w.emoji && w.word !== target.word)
  const card = wordCard(target, pack.id)
  if (target.emoji && emojiWords.length >= 3 && Math.random() < 0.6) {
    const options = shuffle([target, ...pick(emojiWords, 3)]).map((w) => ({
      label: w.word,
      emoji: w.emoji!,
    }))
    return { type: 'wordPicture', prompt: target.word, zh: target.zh, answer: target.word, options, card }
  }
  return { type: 'spell', word: target.word, zh: target.zh, emoji: target.emoji ?? '🔤', card }
}

/** Generate a mixed vocab session (match warm-up + per-word drills). */
export function generateVocabExercises(pack: WordPack, count = 8): Exercise[] {
  const out: Exercise[] = []
  const matchWords = pick(pack.words, Math.min(5, pack.words.length))
  out.push({
    type: 'wordMatch',
    zh: `配对：${pack.zh}`,
    pairs: matchWords.map((w) => ({ en: w.word, cn: w.zh })),
  })
  for (const w of pick(pack.words, count - 1)) out.push(wordExercise(w, pack))
  return out
}

export function makeVocabLesson(pack: WordPack, count = 8): Lesson {
  return {
    id: `vocab-${pack.id}-${Date.now()}`,
    title: `${pack.name} 词汇`,
    emoji: pack.emoji,
    tier: 1,
    skills: ['vocab'],
    topic: pack.id,
    cefr: 'A2',
    exercises: generateVocabExercises(pack, count),
  }
}

/** Look up a word + its pack by the English word (for review regeneration). */
export function findWord(word: string): { entry: WordEntry; pack: WordPack } | null {
  for (const pack of WORD_PACKS) {
    const entry = pack.words.find((w) => w.word === word)
    if (entry) return { entry, pack }
  }
  return null
}

/** Rebuild a review exercise for a word SRS card. */
export function reviewExerciseForWord(word: string): Exercise | null {
  const found = findWord(word)
  return found ? wordExercise(found.entry, found.pack) : null
}
