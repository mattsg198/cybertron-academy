import type { Exercise, Lesson, SkillTag, SrsRef } from '../types'
import { allItems, itemKey } from '../data/curriculum'
import { WORD_PACKS, type WordEntry } from '../data/wordbank'

// ============================================================
// 专项练习 generators — Listening / Speaking / Grammar.
// Pulls real items from the curriculum pool and tops them up with
// auto-generated word drills so a session always has enough.
// SRS cards are attached → mistakes flow into the 错题本.
// ============================================================

export type Skill = 'listen' | 'speak' | 'grammar'

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}
const pick = <T,>(a: T[], n: number): T[] => shuffle(a).slice(0, n)

const allWords = (): WordEntry[] => WORD_PACKS.flatMap((p) => p.words)
const emojiWords = (): WordEntry[] => allWords().filter((w) => w.emoji)
const wordCard = (w: WordEntry): SrsRef => ({ id: `w:${w.word}`, kind: 'word', ref: w.word })

/** Pool items of a given exercise type, each tagged with its SRS item-card. */
function poolByType(types: Exercise['type'][]): Exercise[] {
  return allItems()
    .filter((it) => types.includes(it.type))
    .map((it) => ({
      ...it.exercise,
      card:
        it.exercise.card ??
        ({ id: itemKey(it.lessonId, it.index), kind: 'item', ref: it.lessonId, topic: it.topic } as SrsRef),
    }))
}

/** A generated listening item: hear the word, tap its picture. */
function genListen(target: WordEntry, distractors: WordEntry[]): Exercise {
  const opts = shuffle([target, ...pick(distractors, 3)]).map((w) => w.emoji!)
  return {
    type: 'listen',
    audio: target.word,
    question: 'Tap the word you hear.',
    answer: target.emoji!,
    options: opts,
    card: wordCard(target),
  }
}

function makeLesson(id: string, title: string, emoji: string, skills: SkillTag[], ex: Exercise[]): Lesson {
  return { id: `${id}-${Date.now()}`, title, emoji, tier: 1, skills, cefr: 'A2', exercises: ex }
}

export function makeSkillLesson(skill: Skill, count = 8): Lesson | null {
  if (skill === 'listen') {
    const pool = poolByType(['listen'])
    const ew = emojiWords()
    const gen = pick(ew, Math.max(0, count - Math.min(pool.length, 3))).map((w) =>
      genListen(w, ew.filter((x) => x.emoji !== w.emoji)),
    )
    const ex = shuffle([...pick(pool, 3), ...gen]).slice(0, count)
    return ex.length ? makeLesson('listen', '📡 听力专项', '📡', ['listen'], ex) : null
  }

  if (skill === 'speak') {
    const pool = poolByType(['speak'])
    const gen = pick(allWords(), Math.max(0, count - Math.min(pool.length, 4))).map(
      (w): Exercise => ({ type: 'speak', prompt: w.word, zh: w.zh, card: wordCard(w) }),
    )
    const ex = shuffle([...pick(pool, 4), ...gen]).slice(0, count)
    return ex.length ? makeLesson('speak', '🎙️ 口语专项', '🎙️', ['speak'], ex) : null
  }

  // grammar — fill-in-the-blank + word order from the real curriculum
  const pool = poolByType(['fillBlank', 'sentenceBuild'])
  const ex = pick(pool, count)
  return ex.length ? makeLesson('grammar', '⚙️ 语法专项', '⚙️', ['grammar'], ex) : null
}
